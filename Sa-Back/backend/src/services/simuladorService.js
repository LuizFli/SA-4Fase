import axios from "axios";

class SimuladorService {
  constructor() {}
  async enviarPedidoParaFila(pedido, produtos) {
    try {
      const pedidoId = pedido.id;
      const result = await axios({
        method: "post",
        url: "http://52.1.197.112:3000/queue/items",
        data: {
          payload: {
            orderId: pedidoId,
            order: produtos.map((produto) => {
              return { bloco: produto.bloco };
            }),
          },
          callbackUrl: `http://localhost:3000/pedidos/${pedidoId}`,
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async consultarStatusFila(idFila) {
    try {
      const result = await axios({
        method: "get",
        url: `http://52.1.197.112:3000/queue/items/${idFila}`,
      });
      // Axios returns the response object; we need the payload
      // so controllers can read fields like `status` correctly.
      return result?.data;
    }
     catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const simuladorService = new SimuladorService();
