import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB.connect();
    
    // Démarrage du serveur
    const server = app.listen(PORT, HOST, () => {
      logger.info(`
      ═══════════════════════════════════════════════════════
      🚀 Serveur démarré avec succès!
      📍 URL: http://${HOST}:${PORT}
      📚 Documentation: http://${HOST}:${PORT}/api-docs
      ❤️  Health check: http://${HOST}:${PORT}/health
      🌍 Environnement: ${process.env.NODE_ENV || 'development'}
      ═══════════════════════════════════════════════════════
      `);
    });
    
    // Gestion des erreurs non capturées
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`❌ Erreur non gérée: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });
    
    process.on('uncaughtException', (err: Error) => {
      logger.error(`❌ Exception non capturée: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });
    
    // Gestion de l'arrêt gracieux
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Signal ${signal} reçu, arrêt gracieux...`);
      server.close(async () => {
        await connectDB.disconnect();
        logger.info('👋 Serveur arrêté');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();