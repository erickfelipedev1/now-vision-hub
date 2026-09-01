import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RefreshCw, ExternalLink } from "lucide-react";
import { urlDoEmbed, type UnidadeConfig } from "@/config/dashboards";

/**
 * Embeda um dashboard externo e o mostra POR INTEIRO.
 *
 * O truque: os dois painéis do grupo foram desenhados para tela larga (modo TV).
 * Renderizamos o iframe na largura nativa deles (`larguraBase`) e aplicamos um
 * `transform: scale()` para caber no espaço disponível. Assim nada é cortado na
 * horizontal — o painel só fica proporcionalmente menor.
 *
 * O usuário ainda pode voltar para 100% (aí aparece barra de rolagem) ou entrar
 * em tela cheia, que esconde a sidebar e usa a largura toda do monitor.
 */

type Modo = "ajustar" | "nativo";

export default function DashboardEmbed({
  unidade,
  telaCheia,
  onToggleTelaCheia,
}: {
  unidade: UnidadeConfig;
  telaCheia: boolean;
  onToggleTelaCheia: () => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<Modo>("ajustar");
  const [carregando, setCarregando] = useState(true);
  const [recarregar, setRecarregar] = useState(0);
  const [caixa, setCaixa] = useState({ largura: 0, altura: 0 });

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const medir = () =>
      setCaixa({ largura: el.clientWidth, altura: el.clientHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setCarregando(true);
  }, [unidade.id]);

  const base = unidade.larguraBase ?? 1920;
  const escala =
    modo === "ajustar" && caixa.largura > 0
      ? Math.min(1, caixa.largura / base)
      : 1;

  // Com a escala aplicada, a altura do iframe precisa ser compensada para
  // continuar preenchendo a área visível.
  const alturaIframe =
    modo === "ajustar" && escala > 0 ? caixa.altura / escala : caixa.altura;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#1C242F] bg-[#0D1219] px-5 py-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
          style={{ background: unidade.cor }}
          aria-hidden="true"
        />
        <span className="text-[13px] text-[#8A94A3]">
          {unidade.fonteDados}
        </span>
        {unidade.urlParams?.["periodo"] === "anual" && (
          <span
            className="mr-auto rounded-full border border-[#243040] bg-[#131A23] px-2 py-0.5 text-[11px] text-[#8A94A3]"
            title="O portal pede o recorte anual a este painel; aberto fora do portal ele mantém o padrão dele."
          >
            ano corrente
          </span>
        )}
        {unidade.urlParams?.["periodo"] !== "anual" && <span className="mr-auto" />}

        <div className="flex items-center gap-1 rounded-lg border border-[#1C242F] bg-[#0B0F14] p-1">
          <button
            onClick={() => setModo("ajustar")}
            className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              modo === "ajustar"
                ? "bg-[#1C2635] font-medium text-[#E9EDF2]"
                : "text-[#8A94A3] hover:text-[#E9EDF2]"
            }`}
            title="Encaixa o painel inteiro na largura disponível"
          >
            Painel inteiro
            {modo === "ajustar" && escala < 1 && (
              <span className="ml-1 text-[#6F7987]">
                {Math.round(escala * 100)}%
              </span>
            )}
          </button>
          <button
            onClick={() => setModo("nativo")}
            className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              modo === "nativo"
                ? "bg-[#1C2635] font-medium text-[#E9EDF2]"
                : "text-[#8A94A3] hover:text-[#E9EDF2]"
            }`}
            title="Tamanho original, com rolagem"
          >
            100%
          </button>
        </div>

        <button
          onClick={onToggleTelaCheia}
          className="flex items-center gap-1.5 rounded-lg border border-[#1C242F] px-2.5 py-2 text-[12px] text-[#8A94A3] transition-colors hover:text-[#E9EDF2]"
        >
          {telaCheia ? (
            <Minimize2 size={13} aria-hidden="true" />
          ) : (
            <Maximize2 size={13} aria-hidden="true" />
          )}
          {telaCheia ? "Sair da tela cheia" : "Tela cheia"}
        </button>
        <button
          onClick={() => {
            setCarregando(true);
            setRecarregar((n) => n + 1);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[#1C242F] px-2.5 py-2 text-[12px] text-[#8A94A3] transition-colors hover:text-[#E9EDF2]"
        >
          <RefreshCw size={13} aria-hidden="true" />
          Atualizar
        </button>
        <a
          href={urlDoEmbed(unidade)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-[#1C242F] px-2.5 py-2 text-[12px] text-[#8A94A3] transition-colors hover:text-[#E9EDF2]"
        >
          <ExternalLink size={13} aria-hidden="true" />
          Abrir original
        </a>
      </div>

      <div
        ref={areaRef}
        className={`relative min-h-0 flex-1 bg-[#0B0F14] ${
          modo === "nativo" ? "overflow-auto" : "overflow-hidden"
        }`}
      >
        {carregando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0B0F14]">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-[#1C242F]"
              style={{ borderTopColor: unidade.cor }}
            />
            <p className="text-[13px] text-[#6F7987]">
              Carregando {unidade.nome}…
            </p>
          </div>
        )}

        {caixa.largura > 0 && (
          <iframe
            key={`${unidade.id}-${recarregar}`}
            src={urlDoEmbed(unidade)}
            title={`Dashboard ${unidade.nome}`}
            onLoad={() => setCarregando(false)}
            className="border-0"
            style={{
              // Em ambos os modos o iframe é renderizado na largura nativa do
              // painel; a diferença é que "ajustar" reduz por transform e
              // "nativo" mantém 1:1 e deixa rolar na horizontal.
              width: base,
              height: alturaIframe,
              transform: modo === "ajustar" ? `scale(${escala})` : undefined,
              transformOrigin: "0 0",
            }}
          />
        )}
      </div>

      <p className="shrink-0 border-t border-[#1C242F] bg-[#0D1219] px-5 py-2 text-[11px] text-[#5A6472]">
        Repositório <code className="text-[#6F7987]">{unidade.repo}</code>
        {modo === "ajustar" && escala < 1 && (
          <> · exibido a {Math.round(escala * 100)}% para caber por inteiro</>
        )}
      </p>
    </div>
  );
}
