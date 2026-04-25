import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Établit la connexion à la base de données MongoDB
 * avec gestion des erreurs et retry automatique
 */
class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log(`MongoDB connecté: ${conn.connection.host}`);

      mongoose.connection.on('error', (error) => {
        console.error(' MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error: any) {
      console.error(` Erreur de connexion à MongoDB: ${error.message}`);
      // Retry après 5 secondes
      setTimeout(() => this.connect(), 5000);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    await mongoose.disconnect();
    this.isConnected = false;
    console.log('MongoDB disconnected');
  }
}

export default Database.getInstance();