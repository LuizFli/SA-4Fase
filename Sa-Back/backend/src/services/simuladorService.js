import axios from "axios";
import { env } from "../env.js";

class SimuladorService {
  constructor() {}
  async enviarPedidoParaFila(pedido, produtos) {
    try {
      const pedidoId = pedido.id;
      const result = await axios({
        method: "post",
        url: `${env.simulatorUrl}/queue/items`,
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
        url: `${env.simulatorUrl}/queue/items/${idFila}`,
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
  async consultarHealth() {
      try {
        const result = await axios.get(`${env.simulatorUrl}/health`);
        // Return a simple object with the status code and body so callers
        // can easily check whether it's 200 or another code.
        return {
          status: result.status,
          data: result.data,
        };
      } catch (error) {
        console.log(error);
        // If the request failed with an HTTP response (e.g. 4xx/5xx),
        // surface that status so callers can react to non-200 codes.
        if (error && error.response) {
          return {
            status: error.response.status,
            data: error.response.data,
          };
        }
        throw error;
      }
    }
}

export const simuladorService = new SimuladorService();
