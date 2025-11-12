import axios from "axios";

class SimuladorService {
  // TO-DO TIPAR PEDIDO
  constructor() {}
  async enviarPedidoParaFila(pedido) {
    try {
      const result = await axios({
        method: "post",
        url: "http://52.1.197.112:3000/queue/items",
        data: {
          payload: {
            orderId: pedido.id,
            order: pedido,
          },
          callbackUrl: "http://localhost:3000/pedidos",
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(error, {});
    }
  }
}

export const simuladorService = new SimuladorService();
