<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

function json_response(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function storage_dir(): string {
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_response(['success' => false, 'error' => 'No se pudo crear el almacenamiento'], 500);
    }
    return $dir;
}

function read_data(string $name, array $fallback = []): array {
    $file = storage_dir() . '/' . $name;
    if (is_file($file)) {
        $value = json_decode((string)file_get_contents($file), true);
        return is_array($value) ? $value : $fallback;
    }
    $seed = __DIR__ . '/data/' . $name;
    if (is_file($seed)) {
        $value = json_decode((string)file_get_contents($seed), true);
        if (is_array($value)) {
            write_data($name, $value);
            return $value;
        }
    }
    write_data($name, $fallback);
    return $fallback;
}

function write_data(string $name, array $value): void {
    $file = storage_dir() . '/' . $name;
    $temporary = $file . '.tmp';
    $encoded = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false || file_put_contents($temporary, $encoded, LOCK_EX) === false || !rename($temporary, $file)) {
        @unlink($temporary);
        json_response(['success' => false, 'error' => 'No se pudieron guardar los datos'], 500);
    }
}

function body_json(): array {
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    $postMax = (string)ini_get('post_max_size');
    $maxBytes = 0;
    if (preg_match('/^([0-9]+)\s*([KMG])?$/i', trim($postMax), $match)) {
        $maxBytes = (int)$match[1] * match (strtoupper($match[2] ?? '')) {
            'G' => 1024 * 1024 * 1024,
            'M' => 1024 * 1024,
            'K' => 1024,
            default => 1,
        };
    }
    if ($contentLength > 0 && $maxBytes > 0 && $contentLength > $maxBytes) {
        json_response(['success' => false, 'error' => 'La invitación supera el límite de recepción del servidor. Reduce el tamaño de las imágenes o aumenta post_max_size.'], 413);
    }
    $raw = file_get_contents('php://input');
    if (!$raw) {
        if ($contentLength > 0) {
            json_response(['success' => false, 'error' => 'El servidor recibió una petición vacía. Puede haber excedido el límite PHP de tamaño de datos.'], 413);
        }
        return [];
    }
    $value = json_decode($raw, true);
    if (!is_array($value)) {
        json_response(['success' => false, 'error' => 'Los datos de la invitación no contienen JSON válido.'], 400);
    }
    return $value;
}


/** Send one approved WhatsApp Cloud API template to the event organizer. */
function send_client_whatsapp_notification(array $invitation, array $rsvp): array {
    $rawPhone = (string)($invitation['clientWhatsApp'] ?? '');
    $phone = preg_replace('/[^0-9]/', '', $rawPhone);
    $token = (string)getenv('WHATSAPP_ACCESS_TOKEN');
    $phoneNumberId = (string)getenv('WHATSAPP_PHONE_NUMBER_ID');
    $templateName = (string)(getenv('WHATSAPP_RSVP_TEMPLATE') ?: 'lav_rsvp_notification');
    $language = (string)(getenv('WHATSAPP_TEMPLATE_LANGUAGE') ?: 'es_MX');
    if ($phone === '') return ['sent' => false, 'reason' => 'Falta configurar el WhatsApp del cliente en esta invitación.'];
    if ($token === '' || $phoneNumberId === '') return ['sent' => false, 'reason' => 'Faltan las credenciales de WhatsApp Business Cloud API en el servidor.'];
    if (!function_exists('curl_init')) return ['sent' => false, 'reason' => 'La extensión cURL de PHP no está disponible en el servidor.'];

    $parameters = [
        (string)($rsvp['guestName'] ?? ''),
        !empty($rsvp['attendance']) ? 'CONFIRMÓ ASISTENCIA' : 'NO PODRÁ ASISTIR',
        (string)($rsvp['companionsCount'] ?? 1),
        (string)($invitation['title'] ?? 'Evento'),
        (string)($rsvp['qrCode'] ?? ''),
        'https://lavdigitalagency.com/Invitaciones/QR/' . rawurlencode((string)($rsvp['qrCode'] ?? '')) . '/',
    ];
    $bodyParameters = array_map(static fn($value) => ['type' => 'text', 'text' => mb_substr($value, 0, 200)], $parameters);
    $payload = [
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $phone,
        'type' => 'template',
        'template' => [
            'name' => $templateName,
            'language' => ['code' => $language],
            'components' => [['type' => 'body', 'parameters' => $bodyParameters]],
        ],
    ];
    $ch = curl_init('https://graph.facebook.com/v22.0/' . rawurlencode($phoneNumberId) . '/messages');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    $decoded = is_string($response) ? json_decode($response, true) : null;
    if ($httpCode >= 200 && $httpCode < 300 && !empty($decoded['messages'][0]['id'])) {
        return ['sent' => true, 'messageId' => $decoded['messages'][0]['id']];
    }
    $reason = $curlError !== '' ? $curlError : (string)($decoded['error']['message'] ?? ('WhatsApp API respondió HTTP ' . $httpCode));
    return ['sent' => false, 'reason' => $reason];
}

function now_iso(): string {
    return gmdate('c');
}

function safe_id(string $prefix): string {
    return $prefix . '-' . time() . '-' . bin2hex(random_bytes(3));
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$path = trim((string)($_GET['path'] ?? ''), '/');
$segments = $path === '' ? [] : array_map('rawurldecode', explode('/', $path));
$body = body_json();

if (($segments[0] ?? '') === 'invitations') {
    $id = $segments[1] ?? null;
    if ($method === 'GET' && !$id) {
        json_response(['success' => true, 'invitations' => read_data('invitations.json')]);
    }

    if ($id && count($segments) === 2 && $method === 'GET') {
        $items = read_data('invitations.json');
        foreach ($items as &$item) {
            if (($item['id'] ?? '') === $id) {
                $item['stats'] = $item['stats'] ?? ['views' => 0, 'rsvps' => 0];
                $item['stats']['views'] = (int)($item['stats']['views'] ?? 0) + 1;
                write_data('invitations.json', $items);
                json_response(['success' => true, 'invitation' => $item]);
            }
        }
        json_response(['success' => false, 'error' => 'Invitación no encontrada'], 404);
    }

    if ($method === 'POST' && !$id) {
        $items = read_data('invitations.json');
        $new = $body;
        $new['id'] = $new['id'] ?? safe_id('inv');
        $new['createdAt'] = now_iso();
        $new['updatedAt'] = now_iso();
        $new['stats'] = ['views' => 0, 'rsvps' => 0];
        array_unshift($items, $new);
        write_data('invitations.json', $items);
        json_response(['success' => true, 'invitation' => $new], 201);
    }

    if ($id && count($segments) === 2 && $method === 'PUT') {
        $items = read_data('invitations.json');
        $found = false;
        foreach ($items as $index => $item) {
            if (($item['id'] ?? '') === $id) {
                $items[$index] = array_merge($item, $body, ['id' => $id, 'updatedAt' => now_iso()]);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $body['id'] = $id;
            $body['updatedAt'] = now_iso();
            array_unshift($items, $body);
        }
        write_data('invitations.json', $items);
        json_response(['success' => true, 'invitation' => $found ? $items[$index] : $body]);
    }

    if ($id && count($segments) === 2 && $method === 'DELETE') {
        $items = array_values(array_filter(read_data('invitations.json'), fn($item) => ($item['id'] ?? '') !== $id));
        write_data('invitations.json', $items);
        json_response(['success' => true, 'message' => 'Invitación eliminada']);
    }

    if ($id && ($segments[2] ?? '') === 'duplicate' && $method === 'POST') {
        $items = read_data('invitations.json');
        foreach ($items as $item) {
            if (($item['id'] ?? '') === $id) {
                $copy = $item;
                $copy['id'] = safe_id('inv');
                $copy['title'] = (string)($item['title'] ?? 'Invitación') . ' (Copia)';
                $copy['createdAt'] = now_iso();
                $copy['updatedAt'] = now_iso();
                $copy['stats'] = ['views' => 0, 'rsvps' => 0];
                array_unshift($items, $copy);
                write_data('invitations.json', $items);
                json_response(['success' => true, 'invitation' => $copy], 201);
            }
        }
        json_response(['success' => false, 'error' => 'No se encontró la invitación a duplicar'], 404);
    }

    if ($id && ($segments[2] ?? '') === 'rsvps' && count($segments) === 3 && $method === 'GET') {
        $rsvps = array_values(array_filter(read_data('rsvps.json'), fn($r) => ($r['invitationId'] ?? '') === $id));
        json_response(['success' => true, 'rsvps' => $rsvps]);
    }

    if ($id && ($segments[2] ?? '') === 'rsvp' && $method === 'POST') {
        $guest = trim((string)($body['guestName'] ?? ''));
        if ($guest === '') json_response(['success' => false, 'error' => 'El nombre del invitado es obligatorio'], 400);
        $invitations = read_data('invitations.json');
        $authorizedPasses = 1;
        foreach ($invitations as $savedInvitation) {
            if (($savedInvitation['id'] ?? '') === $id) {
                $authorizedPasses = min(5, max(1, (int)($savedInvitation['rsvpSettings']['maxCompanionsPerPass'] ?? 1)));
                break;
            }
        }
        $rsvps = read_data('rsvps.json');
        $rsvp = [
            'id' => safe_id('rsvp'), 'invitationId' => $id, 'guestName' => $guest,
            'phone' => $body['phone'] ?? '', 'email' => $body['email'] ?? '',
            'companionsCount' => $authorizedPasses,
            'attendance' => $body['attendance'] ?? true,
            'dietaryRestrictions' => $body['dietaryRestrictions'] ?? '', 'message' => $body['message'] ?? '',
            'qrCode' => 'LAV-' . strtoupper(substr($id, -6)) . '-' . strtoupper(bin2hex(random_bytes(3))),
            'checkedIn' => false, 'checkedInCount' => 0, 'checkInHistory' => [], 'createdAt' => now_iso(),
        ];
        array_unshift($rsvps, $rsvp);
        write_data('rsvps.json', $rsvps);
        foreach ($invitations as &$inv) {
            if (($inv['id'] ?? '') === $id) {
                $inv['stats'] = $inv['stats'] ?? ['views' => 0, 'rsvps' => 0];
                $inv['stats']['rsvps'] = (int)($inv['stats']['rsvps'] ?? 0) + 1;
            }
        }
        write_data('invitations.json', $invitations);
        $matchedInvitation = null;
        foreach ($invitations as $savedInvitation) {
            if (($savedInvitation['id'] ?? '') === $id) { $matchedInvitation = $savedInvitation; break; }
        }
        $whatsappNotification = $matchedInvitation
            ? send_client_whatsapp_notification($matchedInvitation, $rsvp)
            : ['sent' => false, 'reason' => 'No se encontró la invitación para notificar al cliente.'];
        json_response(['success' => true, 'rsvp' => $rsvp, 'whatsappNotification' => $whatsappNotification], 201);
    }
}

if ($segments === ['rsvps', 'pass-image'] && $method === 'POST') {
    $passCode = trim((string)($body['passCode'] ?? ''));
    if ($passCode === '' || !preg_match('/^[A-Za-z0-9_-]{1,80}$/', $passCode)) {
        json_response(['success' => false, 'error' => 'Código de pase inválido'], 400);
    }
    $found = false;
    foreach (read_data('rsvps.json') as $rsvp) {
        if (hash_equals((string)($rsvp['qrCode'] ?? ''), $passCode)) { $found = true; break; }
    }
    if (!$found) json_response(['success' => false, 'error' => 'El pase no existe'], 404);
    $fileData = (string)($body['filedata'] ?? '');
    $encoded = preg_replace('/^data:image\/png;base64,/', '', $fileData);
    $decoded = base64_decode($encoded, true);
    if ($decoded === false || !str_starts_with($decoded, "\x89PNG\r\n\x1a\n")) {
        json_response(['success' => false, 'error' => 'La imagen del boleto no es un PNG válido'], 400);
    }
    $qrDirectory = __DIR__ . '/QR';
    if (!is_dir($qrDirectory) && !mkdir($qrDirectory, 0755, true) && !is_dir($qrDirectory)) {
        json_response(['success' => false, 'error' => 'No se pudo acceder a la carpeta pública QR'], 500);
    }
    $filename = $passCode . '.png';
    $target = $qrDirectory . '/' . $filename;
    $temporary = $target . '.tmp';
    if (file_put_contents($temporary, $decoded, LOCK_EX) === false || !rename($temporary, $target)) {
        @unlink($temporary);
        json_response(['success' => false, 'error' => 'No se pudo publicar el boleto en la carpeta QR'], 500);
    }
    json_response(['success' => true, 'imageUrl' => '/Invitaciones/QR/' . rawurlencode($filename)]);
}

if (count($segments) === 3 && $segments[0] === 'rsvps' && $segments[1] === 'pass' && $method === 'GET') {
    $passCode = (string)$segments[2];
    foreach (read_data('rsvps.json') as $rsvp) {
        if (!hash_equals((string)($rsvp['qrCode'] ?? ''), $passCode)) continue;
        $invitation = null;
        foreach (read_data('invitations.json') as $item) {
            if (($item['id'] ?? '') === ($rsvp['invitationId'] ?? '')) { $invitation = $item; break; }
        }
        if (!$invitation) json_response(['success' => false, 'error' => 'Invitación asociada no encontrada'], 404);
        $ticketImagePath = __DIR__ . '/QR/' . preg_replace('/[^A-Za-z0-9_-]/', '', $passCode) . '.png';
        json_response(['success' => true, 'pass' => [
            'id' => $rsvp['id'] ?? '', 'guestName' => $rsvp['guestName'] ?? '',
            'companionsCount' => $rsvp['companionsCount'] ?? 1, 'qrCode' => $rsvp['qrCode'] ?? '',
            'checkedIn' => $rsvp['checkedIn'] ?? false,
            'ticketImageUrl' => is_file($ticketImagePath) ? '/Invitaciones/QR/' . rawurlencode($passCode . '.png') : null,
        ], 'invitation' => [
            'id' => $invitation['id'] ?? '', 'category' => $invitation['category'] ?? 'especiales',
            'title' => $invitation['title'] ?? 'Invitación', 'names' => $invitation['names'] ?? '',
            'eventDate' => $invitation['eventDate'] ?? '', 'eventTime' => $invitation['eventTime'] ?? '',
            'eventLocation' => $invitation['eventLocation'] ?? '', 'primaryColor' => $invitation['primaryColor'] ?? '#8C6D34',
            'accentColor' => $invitation['accentColor'] ?? '#DFC48B',
        ]]);
    }
    json_response(['success' => false, 'error' => 'Pase o código QR no encontrado'], 404);
}

if ($segments === ['rsvps', 'checkin'] && $method === 'POST') {
    $rsvps = read_data('rsvps.json');
    foreach ($rsvps as &$rsvp) {
        if (($rsvp['qrCode'] ?? '') !== ($body['qrCode'] ?? '')) continue;
        $total = (int)($rsvp['companionsCount'] ?? 1);
        $entered = (int)($rsvp['checkedInCount'] ?? 0);
        $count = min(max((int)($body['peopleCheckingIn'] ?? $total), 1), max(0, $total - $entered));
        if ($count <= 0) json_response(['success' => false, 'message' => 'Cupo completo: Todos los invitados de este pase ya ingresaron', 'rsvp' => $rsvp], 400);
        $rsvp['checkedInCount'] = $entered + $count;
        $rsvp['checkedIn'] = $rsvp['checkedInCount'] >= $total;
        $rsvp['checkInHistory'] = $rsvp['checkInHistory'] ?? [];
        $rsvp['checkInHistory'][] = ['timestamp' => now_iso(), 'entered' => $count, 'totalEntered' => $rsvp['checkedInCount']];
        write_data('rsvps.json', $rsvps);
        json_response(['success' => true, 'message' => 'Acceso registrado con éxito (' . $count . ' personas)', 'rsvp' => $rsvp]);
    }
    json_response(['success' => false, 'message' => 'Pase o código QR no encontrado'], 404);
}

if ($segments === ['admin', 'overview'] && $method === 'GET') {
    $invitations = read_data('invitations.json');
    $rsvps = read_data('rsvps.json');
    json_response(['success' => true, 'stats' => [
        'invitationsCount' => count($invitations), 'rsvpsCount' => count($rsvps),
        'totalViews' => array_sum(array_map(fn($i) => (int)($i['stats']['views'] ?? 0), $invitations)),
        'totalGuests' => array_sum(array_map(fn($r) => (int)($r['companionsCount'] ?? 1), $rsvps)),
        'totalCheckedIn' => array_sum(array_map(fn($r) => (int)($r['checkedInCount'] ?? 0), $rsvps)),
    ], 'recentRsvps' => array_slice($rsvps, 0, 10)]);
}

if ($segments === ['upload'] && $method === 'POST') {
    $fileData = (string)($body['filedata'] ?? '');
    if ($fileData === '') json_response(['success' => false, 'error' => 'No se recibieron datos de archivo'], 400);
    $encoded = preg_replace('/^data:[^;]+;base64,/', '', $fileData);
    $decoded = base64_decode($encoded, true);
    if ($decoded === false || !str_starts_with($decoded, "\x89PNG\r\n\x1a\n")) json_response(['success' => false, 'error' => 'Se requiere un PNG válido'], 400);
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) json_response(['success' => false, 'error' => 'No se pudo guardar el archivo'], 500);
    $originalName = preg_replace('/[^a-zA-Z0-9._-]/', '_', (string)($body['filename'] ?? 'archivo.png'));
    $baseName = pathinfo($originalName ?: 'archivo.png', PATHINFO_FILENAME) ?: 'archivo';
    $name = bin2hex(random_bytes(8)) . '-' . $baseName . '.png';
    if (file_put_contents($dir . '/' . $name, $decoded, LOCK_EX) === false) json_response(['success' => false, 'error' => 'No se pudo guardar el archivo'], 500);
    json_response(['success' => true, 'url' => '/Invitaciones/uploads/' . rawurlencode($name), 'filename' => $name]);
}

if ($segments === ['hostinger', 'publish'] && $method === 'POST') {
    $items = read_data('invitations.json');
    $id = (string)($body['invitationId'] ?? '');
    foreach ($items as &$inv) {
        if (($inv['id'] ?? '') !== $id) continue;
        $slug = strtolower((string)preg_replace('/[^a-z0-9-]/', '-', (string)($body['slug'] ?? $inv['title'] ?? $id)));
        $domain = 'https://lavdigitalagency.com';
        $url = $domain . '/Invitaciones/Invitacionespost/' . rawurlencode($slug) . '/?invitationId=' . rawurlencode($id);
        $inv['hostingerPublish'] = ['isConfigured' => true, 'remoteDir' => '/public_html/Invitaciones/Invitacionespost/', 'remoteSlug' => $slug, 'customDomain' => $domain, 'publicUrl' => $url, 'lastPublishedAt' => now_iso(), 'publishStatus' => 'published'];
        write_data('invitations.json', $items);
        json_response(['success' => true, 'message' => 'Invitación empaquetada y lista para Hostinger', 'publicUrl' => $url, 'slug' => $slug]);
    }
    json_response(['success' => false, 'error' => 'Invitación no encontrada'], 404);
}

if (($segments[0] ?? '') === 'hostinger' && ($segments[1] ?? '') === 'export-html' && isset($segments[2]) && $method === 'GET') {
    $items = read_data('invitations.json');
    foreach ($items as $inv) {
        if (($inv['id'] ?? '') !== $segments[2]) continue;
        $title = htmlspecialchars((string)($inv['title'] ?? ''), ENT_QUOTES, 'UTF-8');
        $names = htmlspecialchars((string)($inv['names'] ?? ''), ENT_QUOTES, 'UTF-8');
        $date = htmlspecialchars((string)($inv['eventDate'] ?? ''), ENT_QUOTES, 'UTF-8');
        $time = htmlspecialchars((string)($inv['eventTime'] ?? ''), ENT_QUOTES, 'UTF-8');
        $location = htmlspecialchars((string)($inv['eventLocation'] ?? ''), ENT_QUOTES, 'UTF-8');
        $color = htmlspecialchars((string)($inv['backgroundColor'] ?? '#FDFBF7'), ENT_QUOTES, 'UTF-8');
        $html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . $title . ' — Invitación de Gala</title><meta name="description" content="Invitación digital exclusiva para ' . $names . '."><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:"Plus Jakarta Sans",sans-serif;background:' . $color . ';color:#2D3748}.card{max-width:640px;margin:2rem auto;padding:2rem;background:#ffffffdd;text-align:center;border-radius:1rem}.script{font-family:"Great Vibes",cursive;font-size:3rem}</style></head><body><main class="card"><small>' . $title . '</small><h1 class="script">' . $names . '</h1><p>' . $date . ' · ' . $time . ' hrs</p><h2>Lugar de Celebración</h2><p>' . $location . '</p><a href="https://lavdigitalagency.com/Invitaciones/Invitacionespost/' . rawurlencode((string)($inv['hostingerPublish']['remoteSlug'] ?? $inv['id'])) . '/?invitationId=' . rawurlencode((string)$inv['id']) . '">Confirmar Asistencia (RSVP)</a></main></body></html>';
        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$inv['id']) . '-hostinger.html"');
        echo $html;
        exit;
    }
    http_response_code(404);
    echo 'Invitación no encontrada';
    exit;
}

json_response(['success' => false, 'error' => 'Ruta no encontrada'], 404);
