Add-Type -AssemblyName System.Drawing

$iconOutput = Join-Path $PSScriptRoot "..\public\icons"
New-Item -ItemType Directory -Force -Path $iconOutput | Out-Null

function New-NordicIcon {
    param(
        [int]$Size,
        [string]$OutputPath
    )

    $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
    $canvas = [System.Drawing.Graphics]::FromImage($bitmap)
    $canvas.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $canvas.Clear([System.Drawing.ColorTranslator]::FromHtml("#15362F"))

    $scale = $Size / 512.0
    $inset = 68 * $scale
    $whitePen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#F5F4EF")), (18 * $scale)
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $goldPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#C2A66E")), (7 * $scale)
    $goldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $goldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $mountainPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $mountainPath.AddLines([System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($inset, 322 * $scale),
        [System.Drawing.PointF]::new(196 * $scale, 178 * $scale),
        [System.Drawing.PointF]::new(262 * $scale, 274 * $scale),
        [System.Drawing.PointF]::new(328 * $scale, 150 * $scale),
        [System.Drawing.PointF]::new((512 * $scale) - $inset, 322 * $scale)
    ))
    $canvas.DrawPath($whitePen, $mountainPath)

    $routePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $routePath.AddBezier(
        [System.Drawing.PointF]::new($inset, 368 * $scale),
        [System.Drawing.PointF]::new(186 * $scale, 432 * $scale),
        [System.Drawing.PointF]::new(330 * $scale, 326 * $scale),
        [System.Drawing.PointF]::new((512 * $scale) - $inset, 382 * $scale)
    )
    $canvas.DrawPath($goldPen, $routePath)

    $goldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#C2A66E"))
    foreach ($point in @(
        @(112, 382), @(214, 390), @(318, 358), @(400, 378)
    )) {
        $diameter = 17 * $scale
        $canvas.FillEllipse($goldBrush, (($point[0] * $scale) - ($diameter / 2)), (($point[1] * $scale) - ($diameter / 2)), $diameter, $diameter)
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $goldBrush.Dispose()
    $routePath.Dispose()
    $mountainPath.Dispose()
    $goldPen.Dispose()
    $whitePen.Dispose()
    $canvas.Dispose()
    $bitmap.Dispose()
}

New-NordicIcon -Size 512 -OutputPath (Join-Path $iconOutput "icon-512.png")
New-NordicIcon -Size 192 -OutputPath (Join-Path $iconOutput "icon-192.png")
New-NordicIcon -Size 180 -OutputPath (Join-Path $iconOutput "apple-touch-icon.png")
New-NordicIcon -Size 64 -OutputPath (Join-Path $iconOutput "favicon.png")
