import { useCallback, useEffect, useState } from "react";
import {
  buscarResumos,
  consolidar,
  type ResumoFonte,
} from "@/data/fontes";

export interface ResumoGrupo {
  fontes: ResumoFonte[];
  grupo: ReturnType<typeof consolidar>;
  carregando: boolean;
  /** true enquanto qualquer fonte estiver servindo retrato em vez de API. */
  temRetrato: boolean;
  recarregar: () => void;
}

/**
 * Busca os resumos das duas unidades. Sem cache e sem polling de propósito:
 * a diretoria abre o portal, vê o número do momento e fecha. Se um dia virar
 * tela de parede, dá para acrescentar um intervalo aqui.
 */
export function useResumoGrupo(): ResumoGrupo {
  const [fontes, setFontes] = useState<ResumoFonte[] | null>(null);
  const [gatilho, setGatilho] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    let vivo = true;
    setFontes(null);
    buscarResumos(ac.signal)
      .then((r) => vivo && setFontes(r))
      .catch(() => {
        /* buscarResumos já cai no retrato; só um abort chega aqui */
      });
    return () => {
      vivo = false;
      ac.abort();
    };
  }, [gatilho]);

  const recarregar = useCallback(() => setGatilho((n) => n + 1), []);

  const lista = fontes ?? [];
  return {
    fontes: lista,
    grupo: consolidar(lista),
    carregando: fontes === null,
    temRetrato: lista.some((f) => f.estado === "retrato"),
    recarregar,
  };
}
