<?php
declare(strict_types=1);

function lav_public_record(string $id): ?array {
    foreach (read_data('publications.json') as $publication) {
        if (($publication['invitation']['id'] ?? '') === $id) return $publication['invitation'];
    }
    foreach (read_data('invitations.json') as $invitation) {
        if (($invitation['id'] ?? '') === $id
            && empty($invitation['savedTemplate'])
            && ($invitation['hostingerPublish']['publishStatus'] ?? '') === 'published') return $invitation;
    }
    return null;
}

function lav_preserve_legacy_publication(array $invitation): void {
    if (!empty($invitation['savedTemplate']) || ($invitation['hostingerPublish']['publishStatus'] ?? '') !== 'published') return;
    $rows = read_data('publications.json');
    foreach ($rows as $row) if (($row['invitation']['id'] ?? '') === $invitation['id']) return;
    $rows[] = ['routes' => [], 'invitation' => $invitation];
    write_data('publications.json', $rows);
}

function lav_public_invitation(): never {
    $route = trim((string)($_GET['route'] ?? ''), '/');
    $id = (string)($_GET['id'] ?? '');
    $invitation = null;
    if (substr_count($route, '/') === 1) {
        foreach (read_data('publications.json') as $publication) {
            if (in_array($route, $publication['routes'], true)) {
                $invitation = $publication['invitation'];
                break;
            }
        }
    } elseif ($id !== '') {
        $invitation = lav_public_record($id);
    }
    if (!$invitation) json_response(['error' => 'Invitación no disponible'], 404);
    $mode = $invitation['hostingerPublish']['mode'] ?? 'final';
    unset($invitation['stats'], $invitation['templateDescription'], $invitation['clientWhatsApp'], $invitation['hostingerPublish']);
    $invitation['hostingerPublish'] = ['isConfigured' => true, 'mode' => $mode];
    // The visitor needs the form configuration, but never notification credentials.
    unset($invitation['rsvpSettings']['clientWhatsApp']);
    json_response(['success' => true, 'invitation' => $invitation]);
}

function lav_public_manifest(): never {
    $start = (string)($_GET['start'] ?? '');
    if (!preg_match('~^/Invitaciones/(?:Invitacionespost/[a-z0-9-]+(?:/[a-z0-9-]+)?/?)?$~iD', (string)parse_url($start, PHP_URL_PATH))) {
        json_response(['error' => 'Dirección inválida'], 422);
    }
    header('Content-Type: application/manifest+json');
    if (!str_starts_with($start, '/Invitaciones/')) json_response(['error' => 'Dirección inválida'], 422);
    echo json_encode([
        'id' => $start, 'name' => 'Invitación LAV', 'short_name' => 'Invitación',
        'start_url' => $start, 'scope' => '/Invitaciones/', 'display' => 'standalone',
        'background_color' => '#FDFBF7', 'theme_color' => '#FDFBF7',
        'icons' => [
            ['src' => '/Invitaciones/pwa-192x192.png', 'sizes' => '192x192', 'type' => 'image/png'],
            ['src' => '/Invitaciones/pwa-512x512.png', 'sizes' => '512x512', 'type' => 'image/png'],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function lav_unpublish(string $id): void {
    $keep = [];
    $routes = [];
    foreach (read_data('publications.json') as $row) {
        if (($row['invitation']['id'] ?? '') === $id) $routes = $row['routes'];
        else $keep[] = $row;
    }
    write_data('publications.json', $keep);
    foreach ($routes as $route) {
        if (!preg_match('~^[a-z0-9-]+/[a-z0-9-]+$~D', $route)) continue;
        $folder = __DIR__ . '/Invitacionespost/' . $route;
        if (is_dir($folder) && !is_link($folder)) @rmdir($folder);
        if (is_dir(dirname($folder)) && !is_link(dirname($folder))) @rmdir(dirname($folder));
    }
}

function lav_publish(array $body): never {
    $id = (string)($body['invitationId'] ?? '');
    $client = (string)($body['client'] ?? '');
    $slug = (string)($body['slug'] ?? '');
    $mode = (string)($body['mode'] ?? '');
    foreach ([$client, $slug] as $segment) {
        if (!preg_match('/^[a-z0-9][a-z0-9-]{0,79}$/D', $segment)) {
            json_response(['error' => 'Usa letras minúsculas, números y guiones en las carpetas'], 422);
        }
    }
    if (!in_array($mode, ['demo', 'final'], true)) json_response(['error' => 'Modo de publicación inválido'], 422);
    $route = "$client/$slug";
    $publications = read_data('publications.json');
    $current = null;
    foreach ($publications as $index => $row) {
        if (($row['invitation']['id'] ?? '') === $id) $current = $index;
        elseif (in_array($route, $row['routes'], true)) json_response(['error' => 'Esa dirección ya pertenece a otra invitación'], 409);
    }
    $items = read_data('invitations.json');
    foreach ($items as $index => $invitation) {
        if (($invitation['id'] ?? '') !== $id) continue;
        $prior = $invitation['hostingerPublish'] ?? [];
        if (!empty($invitation['savedTemplate'])) json_response(['error' => 'Crea una invitación a partir de la plantilla antes de publicar'], 422);
        if ($mode === 'demo' && ($prior['publishStatus'] ?? '') === 'published'
            && ($prior['mode'] ?? 'final') === 'final' && empty($body['confirmDemo'])) {
            json_response(['error' => 'Confirma el reemplazo de la versión definitiva por una DEMO'], 409);
        }
        $root = __DIR__ . '/Invitacionespost';
        $directory = $root;
        foreach ([$client, $slug] as $part) {
            $directory .= '/' . $part;
            if (is_link($directory) || (!is_dir($directory) && !mkdir($directory, 0755))) {
                json_response(['error' => 'Hostinger no pudo preparar la carpeta de publicación'], 500);
            }
        }
        $domain = 'https://lavdigitalagency.com';
        $base = '/Invitaciones/Invitacionespost/';
        $config = [
            'isConfigured' => true, 'remoteDir' => '/public_html' . $base . $route . '/',
            'remoteSlug' => $slug, 'clientFolder' => $client, 'customDomain' => $domain,
            'publicUrl' => $domain . $base . $route . '/', 'publishStatus' => 'published',
            'lastPublishedAt' => now_iso(), 'mode' => $mode,
        ];
        $invitation['hostingerPublish'] = $config;
        $routes = $current === null ? [] : $publications[$current]['routes'];
        $publications[$current ?? count($publications)] = [
            'routes' => array_values(array_unique([...$routes, $route])),
            'invitation' => $invitation,
        ];
        write_data('publications.json', $publications);
        $items[$index] = $invitation;
        write_data('invitations.json', $items);
        json_response(['success' => true, 'invitation' => $invitation]);
    }
    json_response(['error' => 'Invitación no encontrada'], 404);
}
