import amqp, { Connection, Channel } from 'amqplib';

export class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly exchangeName: string = 'order_events';

  constructor(url?: string) {
    this.url = url || process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  /**
   * Conecta a RabbitMQ y crea el canal y exchange
   */
  async connect(): Promise<void> {
    try {
      console.log('🔄 Conectando a RabbitMQ...');
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      
      // Crear exchange de tipo topic para eventos de pedidos
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true
      });

      console.log('✅ Conectado a RabbitMQ exitosamente');
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Publica un evento relacionado con pedidos
   * @param routingKey - Clave de enrutamiento (ej: 'order.created', 'order.updated')
   * @param message - Mensaje a publicar
   */
  async publishEvent(routingKey: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ no está conectado. Llama a connect() primero.');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));

      const published = this.channel.publish(
        this.exchangeName,
        routingKey,
        messageBuffer,
        {
          persistent: true // Los mensajes se guardan en disco
        }
      );

      if (published) {
        console.log(`📤 Evento publicado: ${routingKey}`, message);
      } else {
        console.warn(`⚠️ Buffer lleno, evento no publicado: ${routingKey}`);
      }

      return published;
    } catch (error) {
      console.error(`❌ Error publicando evento ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Cierra la conexión a RabbitMQ
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('🔌 Conexión a RabbitMQ cerrada');
    } catch (error) {
      console.error('❌ Error cerrando conexión a RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Instancia singleton del cliente RabbitMQ
export const rabbitMQClient = new RabbitMQClient();

