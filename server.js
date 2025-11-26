    // server.js - Servidor web para mantener el bot activo
    import express from 'express';
    const app = express();
    const port = process.env.PORT || 3000;

    // Ruta para monitoreo (UptimeRobot usará esta)
    app.get('/ping', (req, res) => {
        res.status(200).json({ 
            status: 'ok', 
            bot: 'WorldOfAlbion',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    // Puerto que Render asigna automáticamente
    app.listen(port, () => {
        console.log(`[INFO] Servidor web activo en puerto ${port}`);
    });