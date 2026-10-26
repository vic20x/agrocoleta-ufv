"use client";

import { useState } from "react";
import { MessageSquare, Copy, Check, ExternalLink, X } from "lucide-react";

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  producerName?: string;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  defaultPhone = "",
  producerName = "",
}: WhatsAppShareModalProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://agrocoleta.com.br";
  
  const greeting = producerName ? `Olá, ${producerName}!` : "Olá, produtor(a)!";
  const defaultMessage = `${greeting} Tudo bem?

Estamos realizando um levantamento de dados das propriedades rurais para o nosso projeto de estágio agronômico. 

Criamos uma plataforma super simples e rápida para você registrar as informações da sua terra e da sua produção (leva menos de 3 minutinhos no celular):

Link direto: ${currentUrl}

A sua participação é fundamental para mapearmos a região e oferecermos apoio técnico. Muito obrigado.`;

  const cleanPhone = phone.replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Enviar Link pelo WhatsApp</h3>
            <p className="text-xs text-slate-500">Compartilhe o formulário diretamente com o produtor</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp do Produtor (opcional para envio direto):
            </label>
            <input
              type="text"
              placeholder="(XX) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mensagem pronta formatada:
            </label>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap border border-slate-200 max-h-44 overflow-y-auto">
              {defaultMessage}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                  <span className="text-emerald-700">Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-700/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
              <span>Abrir WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
