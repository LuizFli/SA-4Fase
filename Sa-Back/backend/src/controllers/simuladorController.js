import { simuladorService } from "../services/simuladorService.js";

export const simuladorHealth = async (req, res) => {
  try {
    const resultado = await simuladorService.consultarHealth();
    const status = resultado?.status ?? null;
    const data = resultado?.data ?? null;
    const online = status === 200;
    return res.status(200).json({ online, status, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ online: false, status: null, error: String(error) });
  }
};
