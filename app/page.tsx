"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Truck,
  AlertTriangle,
  Percent,
  Shield,
  FileText,
  CreditCard,
  ArrowRight,
  Phone,
  Mail,
  Target,
  Handshake,
  Rocket,
} from "lucide-react"
// Import the Select components
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function ROICalculator() {
  const [mostrarSimulador, setMostrarSimulador] = useState(false)
  const [dadosLead, setDadosLead] = useState({ nome: "", email: "", telefone: "", empresa: "", cnpj: "" })
  const [enviandoLead, setEnviandoLead] = useState(false)
  const [aceitouLGPD, setAceitouLGPD] = useState(false)

  // Estados do simulador (mantidos da versão anterior)
  const [frota, setFrota] = useState(1000)
  const [percentualMultas, setPercentualMultas] = useState(40)
  const [ticketMedio, setTicketMedio] = useState(220)
  const [reducaoLW, setReducaoLW] = useState(20)
  const [custoPlaca, setCustoPlaca] = useState(7)
  const [planoSelecionado, setPlanoSelecionado] = useState("lite")
  const [percentualNICs, setPercentualNICs] = useState(20)

  const [nicsGeradas, setNicsGeradas] = useState(0)
  const [valorTotalNICs, setValorTotalNICs] = useState(0)
  const [ganhoCustoNIC, setGanhoCustoNIC] = useState(0)

  const planos = {
    lite: {
      nome: "Lite",
      descricao: "Captura automática de infrações",
      detalhes: "Monitoramento completo das multas da sua frota com relatórios detalhados",
      valorMinimo: 7.9, // Changed from 7 to 7.90
      cor: "bg-blue-400",
      mensagemFinal: "consultar as multas de forma automática e capturar as infrações",
    },
    plus: {
      nome: "Plus",
      descricao: "Captura + Indicação de Condutores",
      detalhes: "Além da captura, identificamos automaticamente os condutores responsáveis",
      valorMinimo: 11.9, // Changed from 10 to 11.90
      cor: "bg-blue-500",
      mensagemFinal: "consultar as multas de forma automática, capturar e realizar a indicação de condutores",
    },
    premium: {
      nome: "Premium",
      descricao: "Captura + Indicação + Pagamento",
      detalhes: "Serviço completo: capturamos, indicamos e pagamos os autos para você",
      valorMinimo: 14.4, // Changed from 12 to 14.40
      cor: "bg-blue-600",
      mensagemFinal:
        "consultar as multas de forma automática, capturar as infrações, realizar a indicação de condutor e efetuar o pagamento",
    },
  }

  // Cálculos automáticos (mantidos da versão anterior)
  const [custoSemLW, setCustoSemLW] = useState(0)
  const [custoComLW, setCustoComLW] = useState(0)
  const [investimentoTotal, setInvestimentoTotal] = useState(0)
  const [economia, setEconomia] = useState(0)
  const [roiLiquido, setRoiLiquido] = useState(0)
  const [roiPercentual, setRoiPercentual] = useState(0)

  // Função para validar email
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Função para validar telefone (formato brasileiro específico)
  const validarTelefone = (telefone: string) => {
    // Remove formatação para validar apenas os números
    const apenasNumeros = telefone.replace(/\D/g, "")
    // Valida se tem 10 ou 11 dígitos (DDD + número)
    return apenasNumeros.length === 10 || apenasNumeros.length === 11
  }

  // Função para formatar telefone automaticamente
  const formatarTelefone = (valor: string) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "")

    // Limita a 11 dígitos
    const limitado = apenasNumeros.substring(0, 11)

    // Aplica a máscara conforme o tamanho
    if (limitado.length <= 2) {
      return limitado
    } else if (limitado.length <= 7) {
      return `(${limitado.substring(0, 2)}) ${limitado.substring(2)}`
    } else {
      return `(${limitado.substring(0, 2)}) ${limitado.substring(2, 7)}-${limitado.substring(7)}`
    }
  }

  // Função para formatar CNPJ automaticamente
  const formatarCNPJ = (valor: string) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "")

    // Limita a 14 dígitos
    const limitado = apenasNumeros.substring(0, 14)

    // Aplica a máscara conforme o tamanho
    if (limitado.length <= 2) {
      return limitado
    } else if (limitado.length <= 5) {
      return `${limitado.substring(0, 2)}.${limitado.substring(2)}`
    } else if (limitado.length <= 8) {
      return `${limitado.substring(0, 2)}.${limitado.substring(2, 5)}.${limitado.substring(5)}`
    } else if (limitado.length <= 12) {
      return `${limitado.substring(0, 2)}.${limitado.substring(2, 5)}.${limitado.substring(5, 8)}/${limitado.substring(8)}`
    } else {
      return `${limitado.substring(0, 2)}.${limitado.substring(2, 5)}.${limitado.substring(5, 8)}/${limitado.substring(8, 12)}-${limitado.substring(12)}`
    }
  }

  // Função para validar CNPJ
  const validarCNPJ = (cnpj: string) => {
    const apenasNumeros = cnpj.replace(/\D/g, "")
    return apenasNumeros.length === 14
  }

  // Função para enviar lead
  const enviarLead = async () => {
    if (!dadosLead.nome || !dadosLead.email || !dadosLead.telefone || !dadosLead.cnpj) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!validarEmail(dadosLead.email)) {
      alert("Por favor, insira um email válido.")
      return
    }

    if (!validarTelefone(dadosLead.telefone)) {
      alert("Por favor, insira um telefone válido (ex: (41) 99999-9999).")
      return
    }

    if (!validarCNPJ(dadosLead.cnpj)) {
      alert("Por favor, insira um CNPJ válido (14 dígitos).")
      return
    }

    if (!aceitouLGPD) {
      alert("Por favor, aceite os termos da LGPD para continuar.")
      return
    }

    setEnviandoLead(true)

    // Simular envio do lead (aqui você integraria com seu backend/email)
    try {
      // Exemplo de como seria o envio para um webhook ou API
      const leadData = {
        ...dadosLead,
        aceitouLGPD,
        timestamp: new Date().toISOString(),
        origem: "Simulador ROI - Feira",
        ip: "IP_DO_USUARIO", // Seria capturado no backend
      }

      console.log("Lead capturado:", leadData)

      // Aqui você faria a chamada real para sua API
      // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(leadData) })

      // Simular delay de envio
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMostrarSimulador(true)
    } catch (error) {
      alert("Erro ao processar seus dados. Tente novamente.")
    } finally {
      setEnviandoLead(false)
    }
  }

  // Função para lidar com mudança de plano (mantida da versão anterior)
  const handlePlanoChange = (novoPlano: string) => {
    setPlanoSelecionado(novoPlano)
    setCustoPlaca(planos[novoPlano as keyof typeof planos].valorMinimo)
  }

  // Função para encerrar simulação e enviar WhatsApp com todos os dados
  const encerrarSimulacao = () => {
    const mensagem = `🎯 *SIMULAÇÃO ROI - LW TECNOLOGIA*

👤 *DADOS DO CLIENTE:*
• Nome: ${dadosLead.nome}
• Email: ${dadosLead.email}
• Telefone: ${dadosLead.telefone}
• Empresa: ${dadosLead.empresa}
• CNPJ: ${dadosLead.cnpj}

🚛 *DADOS DA FROTA:*
• Total da Frota: ${frota.toLocaleString()} veículos
• % Veículos com Multas/Mês: ${percentualMultas}%
• Ticket Médio por Multa: ${formatCurrency(ticketMedio)}
• % Veículos que Geram NIC: ${percentualNICs}%
• Desconto Aplicado: ${reducaoLW}%
• Plano Escolhido: ${planos[planoSelecionado as keyof typeof planos].nome}
• Investimento por Placa: ${formatCurrency(custoPlaca)}

💰 *RESULTADOS DA SIMULAÇÃO:*
• Custo Mensal SEM LW: ${formatCurrency(custoSemLW)}
• Custo Mensal COM LW: ${formatCurrency(custoComLW)}
• Economia com Desconto: ${formatCurrency(custoSemLW * (reducaoLW / 100))}
${planoSelecionado === "plus" || planoSelecionado === "premium" ? `• Economia Evitando NICs: ${formatCurrency(ganhoCustoNIC)}` : ""}
• Economia Mensal Total: ${formatCurrency(economia)}
• Investimento Mensal LW: ${formatCurrency(investimentoTotal)}
• ROI Líquido Mensal: ${formatCurrency(roiLiquido)}
• ROI Percentual: ${formatPercent(roiPercentual)}

${
  planoSelecionado === "plus" || planoSelecionado === "premium"
    ? `📋 *DETALHES DAS NICs:*
• NICs Geradas/Mês: ${Math.round(nicsGeradas)} unidades
• Valor por NIC: ${formatCurrency(ticketMedio * 2)}
• Total NICs Evitadas: ${formatCurrency(valorTotalNICs)}

`
    : ""
}📊 *PROJEÇÃO ANUAL:*
• Economia Anual: ${formatCurrency(economia * 12)}
• ROI Líquido Anual: ${formatCurrency(roiLiquido * 12)}

🎉 O cliente demonstrou interesse em nossos serviços através do simulador ROI!`

    const numeroWhatsApp = "5541995918359" // Número corrigido
    const mensagemCodificada = encodeURIComponent(mensagem)
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`

    window.open(urlWhatsApp, "_blank")
  }

  // UseEffect para cálculos (atualizado para remover trava do ticket médio)
  useEffect(() => {
    if (!mostrarSimulador) return

    const valorMinimo = planos[planoSelecionado as keyof typeof planos].valorMinimo
    if (custoPlaca < valorMinimo) {
      setCustoPlaca(valorMinimo)
    }

    // Cálculos básicos
    const veiculosMultados = frota * (percentualMultas / 100)
    const custoMensal = veiculosMultados * ticketMedio
    setCustoSemLW(custoMensal)

    // Cálculos de NIC
    const nicsCalculadas = veiculosMultados * (percentualNICs / 100)
    setNicsGeradas(nicsCalculadas)

    const valorUnitarioNIC = ticketMedio * 2
    const valorTotalNICsCalculado = nicsCalculadas * valorUnitarioNIC
    setValorTotalNICs(valorTotalNICsCalculado)

    // Ganho com NIC (apenas para planos Plus e Premium)
    const ganhoNIC = planoSelecionado === "plus" || planoSelecionado === "premium" ? valorTotalNICsCalculado : 0
    setGanhoCustoNIC(ganhoNIC)

    // Economia com desconto nas multas
    const economiaDesconto = custoMensal * (reducaoLW / 100)

    // Custo com LW (apenas com desconto aplicado, SEM incluir benefício NIC)
    const custoComLWCalculado = custoMensal - economiaDesconto
    setCustoComLW(custoComLWCalculado)

    // Economia total (desconto + ganho NIC)
    const economiaTotal = economiaDesconto + ganhoNIC
    setEconomia(economiaTotal)

    const investimento = frota * custoPlaca
    setInvestimentoTotal(investimento)

    const roiLiquidoCalculado = economiaTotal - investimento
    setRoiLiquido(roiLiquidoCalculado)

    const roiPerc = custoMensal > 0 ? (roiLiquidoCalculado / custoMensal) * 100 : 0
    setRoiPercentual(roiPerc)
  }, [frota, percentualMultas, ticketMedio, reducaoLW, custoPlaca, planoSelecionado, percentualNICs, mostrarSimulador])

  // Adicione este useEffect logo após os outros useEffects, antes do return
  useEffect(() => {
    if (mostrarSimulador) {
      // Rola suavemente para o topo da página quando o simulador é mostrado
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }, [mostrarSimulador])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Adicione este estilo CSS no início do componente, logo após os imports:
  const styles = `
@keyframes scroll {
0% {
transform: translateX(0);
}
100% {
transform: translateX(-100%);
}
}

.animate-scroll {
animation: scroll 12s linear infinite;
}

.animate-scroll:hover {
animation-play-state: paused;
}
`

  // Landing Page de Captura de Leads
  if (!mostrarSimulador) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-4 relative overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header com Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/lw-tecnologia-logo.png"
                alt="LW Tecnologia - Gestão Inteligente de Multas"
                className="h-28 object-contain"
              />
            </div>
            <h2 className="text-3xl font-semibold text-blue-200 mb-4">Gestão Inteligente de Multas</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Reduza em até 90% os custos com multas da sua frota através da nossa tecnologia avançada, que capta dados
              diretamente do Senatran e oferece cobertura em todo o território nacional.
            </p>
          </div>

          {/* Produtos LW Multas */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 hover:scale-105 transition-transform">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">LW Multas Lite</h3>
                <p className="text-slate-600 mb-4">Captura automática de infrações com monitoramento 24/7</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(planos.lite.valorMinimo)}</div>
                <p className="text-sm text-slate-500 mb-2">por placa/mês</p>
                <p className="text-xs text-slate-400 italic">os valores são acima de 1.000 placas</p>
              </CardContent>
            </Card>

            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 hover:scale-105 transition-transform border-2 border-blue-500">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">LW Multas Plus</h3>
                <p className="text-slate-600 mb-4">Captura + Indicação automática de condutores</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(planos.plus.valorMinimo)}</div>
                <p className="text-sm text-slate-500 mb-2">por placa/mês</p>
                <p className="text-xs text-slate-400 italic mb-3">os valores são acima de 1.000 placas</p>
                <div className="mt-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    MAIS POPULAR
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 hover:scale-105 transition-transform">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">LW Multas Premium</h3>
                <p className="text-slate-600 mb-4">Serviço completo: captura, indicação e pagamento</p>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(planos.premium.valorMinimo)}
                </div>
                <p className="text-sm text-slate-500 mb-2">por placa/mês</p>
                <p className="text-xs text-slate-400 italic">os valores são acima de 1.000 placas</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfólio de Produtos LW */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">NOSSO PORTFÓLIO COMPLETO</h3>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Soluções integradas para gestão completa da sua frota
              </p>
            </div>

            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
              <CardContent className="p-8">
                <div className="flex justify-center">
                  <img
                    src="/images/lw-produtos-completo.png"
                    alt="Portfólio Completo LW Tecnologia - Soluções integradas para gestão de frotas"
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-slate-600 max-w-3xl mx-auto">
                    Oferecemos uma suíte completa de soluções para gestão de frotas: documentação, emplacamento, captura
                    de multas, indicações de condutor, pagamentos de infrações, consulta de débitos, rastreamento e
                    sistemas integrados para otimizar todos os processos da sua empresa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefícios */}
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 mb-8">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 text-center mb-4">Por que escolher a LW Tecnologia?</h3>
              <p className="text-slate-600 text-center mb-8 max-w-3xl mx-auto">
                Somos uma empresa conveniada junto ao <strong>RENAINF</strong>, que nos proporciona uma captura de 100%
                das infrações devidamente registradas no <strong>RENAINF</strong>. Estamos orgulhosos do impacto
                positivo que tivemos na gestão de frotas. Alguns números que definem nossa jornada:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-white mb-2">Mais de 25 anos</h4>
                  <p className="text-blue-100">de experiência no setor</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-white mb-2">Mais de 140</h4>
                  <p className="text-blue-100">clientes satisfeitos</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-white mb-2">Mais de 90%</h4>
                  <p className="text-blue-100">de redução na burocracia</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-white mb-2">Média de 95%</h4>
                  <p className="text-blue-100">de melhora da eficiência</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Clientes */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">CLIENTES QUE JÁ FIZERAM A ESCOLHA CERTA</h3>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Otimizamos processos e reduzimos custos com uma gestão de frotas eficiente
              </p>
            </div>

            {/* Carrossel de Logos */}
            <div className="relative overflow-hidden bg-white/10 backdrop-blur rounded-lg py-8">
              <div className="flex animate-scroll">
                {/* Primeira sequência de logos - cada empresa em seu próprio card */}
                <div className="flex items-center min-w-full">
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0098.jpg-32RuBC6Sq5Pu75d8JlIcY9gM3lyni9.jpeg"
                      alt="Parvi Locadora"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0100.jpg-VUAjo87gIXM6749dVQ5U5PSZmItfE6.jpeg"
                      alt="Renault"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0096.jpg-9jTQOfWMlCY0Y1hAWvnZsMGzkRjN7F.jpeg"
                      alt="Volvo"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0101.jpg-Kv8zDtUbY9xsLyymo7T1EuADvOpXg9.jpeg"
                      alt="Unidas"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0097.jpg-32I2rSwN0bDUoI7bBtO1jvp9NqFKxx.jpeg"
                      alt="Grupo Vamos"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOVIDA-cJ9PfkEo1k4L8WRkVCLdzopaCSCo8g.png"
                      alt="Movida"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202025-07-30%20191842-ZevBEBg0ywvLsRefcdeJtz7ljkhp4c.png"
                      alt="Kovi"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Segunda sequência (duplicada para efeito infinito) */}
                <div className="flex items-center min-w-full">
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0098.jpg-32RuBC6Sq5Pu75d8JlIcY9gM3lyni9.jpeg"
                      alt="Parvi Locadora"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0100.jpg-VUAjo87gIXM6749dVQ5U5PSZmItfE6.jpeg"
                      alt="Renault"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0096.jpg-9jTQOfWMlCY0Y1hAWvnZsMGzkRjN7F.jpeg"
                      alt="Volvo"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0101.jpg-Kv8zDtUbY9xsLyymo7T1EuADvOpXg9.jpeg"
                      alt="Unidas"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250730-WA0097.jpg-32I2rSwN0bDUoI7bBtO1jvp9NqFKxx.jpeg"
                      alt="Grupo Vamos"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOVIDA-cJ9PfkEo1k4L8WRkVCLdzopaCSCo8g.png"
                      alt="Movida"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-6 mx-4 shadow-lg w-48 h-24 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202025-07-30%20191842-ZevBEBg0ywvLsRefcdeJtz7ljkhp4c.png"
                      alt="Kovi"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Captura de Lead */}
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-center text-2xl">Calcule Gratuitamente o ROI da Sua Empresa</CardTitle>
              <CardDescription className="text-center text-blue-100">
                Descubra quanto você pode economizar com o LW Multas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={dadosLead.nome}
                    onChange={(e) => setDadosLead({ ...dadosLead, nome: e.target.value })}
                    className="text-lg border-slate-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa" className="text-sm font-medium text-slate-700">
                    Empresa *
                  </Label>
                  <Input
                    id="empresa"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={dadosLead.empresa}
                    onChange={(e) => setDadosLead({ ...dadosLead, empresa: e.target.value })}
                    className="text-lg border-slate-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-sm font-medium text-slate-700">
                    CNPJ *
                  </Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={dadosLead.cnpj}
                    onChange={(e) => {
                      const valorFormatado = formatarCNPJ(e.target.value)
                      setDadosLead({ ...dadosLead, cnpj: valorFormatado })
                    }}
                    className="text-lg border-slate-300 focus:border-blue-500"
                    maxLength={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={dadosLead.email}
                      onChange={(e) => setDadosLead({ ...dadosLead, email: e.target.value })}
                      className="text-lg pl-10 border-slate-300 focus:border-blue-500"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="telefone" className="text-sm font-medium text-slate-700">
                    Telefone *
                  </Label>
                  <div className="relative">
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(41) 99999-9999"
                      value={dadosLead.telefone}
                      onChange={(e) => {
                        const valorFormatado = formatarTelefone(e.target.value)
                        setDadosLead({ ...dadosLead, telefone: valorFormatado })
                      }}
                      className="text-lg pl-10 border-slate-300 focus:border-blue-500"
                      maxLength={15}
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Checkbox LGPD */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="lgpd"
                    checked={aceitouLGPD}
                    onChange={(e) => setAceitouLGPD(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="lgpd" className="text-sm text-slate-700 cursor-pointer">
                      <span className="font-medium">Aceito os termos da LGPD *</span>
                      <p className="mt-1 text-xs text-slate-600">
                        Concordo com o tratamento dos meus dados pessoais de acordo com a Lei Geral de Proteção de Dados
                        (LGPD). Seus dados serão utilizados exclusivamente para contato comercial e não serão
                        compartilhados com terceiros. Você pode solicitar a exclusão dos seus dados a qualquer momento
                        através do email: comercial@lwtecnologia.com.br
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  onClick={enviarLead}
                  disabled={enviandoLead}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg font-semibold shadow-lg"
                >
                  {enviandoLead ? (
                    "Processando..."
                  ) : (
                    <>
                      Acessar Simulador Gratuito
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    * Campos obrigatórios. Seus dados estão seguros conosco.
                  </p>
                  <p className="text-xs text-slate-500 max-w-2xl mx-auto">
                    🔒 Garantimos total segurança e privacidade dos seus dados. Utilizamos criptografia avançada e
                    seguimos rigorosamente as normas da LGPD. Seus dados nunca serão vendidos ou compartilhados com
                    terceiros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 space-y-4">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/images/lw-tecnologia-logo.png"
                alt="LW Tecnologia - Gestão Inteligente de Multas"
                className="h-16 object-contain"
              />
            </div>
            <div className="text-blue-200 space-y-2">
              <p className="font-semibold">LW TECNOLOGIA LTDA</p>
              <p>CNPJ: 25.462.472/0001-97</p>
              <p>Email: comercial@lwtecnologia.com.br</p>
              <p>Endereço Matriz Curitiba: R. XV de Novembro, 621 2º andar Centro, Curitiba PR, 80020-310</p>
              <p className="mt-4">© 2024 LW Tecnologia - Gestão Inteligente de Multas</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/lw-tecnologia-logo.png"
              alt="LW Tecnologia - Gestão Inteligente de Multas"
              className="h-20 object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-blue-200 mb-2">Calculadora de ROI - {dadosLead.nome}</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            {dadosLead.empresa && `${dadosLead.empresa} - `}
            Descubra quanto sua empresa pode economizar com nossos serviços de gestão de multas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Dados da Sua Frota e Condições
              </CardTitle>
              <CardDescription className="text-blue-100">
                Insira os dados da sua empresa para calcular o ROI
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="frota" className="text-sm font-medium text-slate-700">
                  Total da Frota (veículos)
                </Label>
                <Input
                  id="frota"
                  type="number"
                  value={frota}
                  onChange={(e) => setFrota(Number(e.target.value))}
                  className="text-lg border-slate-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentual" className="text-sm font-medium text-slate-700">
                  % Média de Veículos que Recebem Multas por Mês
                </Label>
                <div className="relative">
                  <Input
                    id="percentual"
                    type="number"
                    value={percentualMultas}
                    onChange={(e) => {
                      const valor = Number(e.target.value)
                      setPercentualMultas(valor)
                    }}
                    className="text-lg pr-8 border-slate-300 focus:border-blue-500"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualNICs" className="text-sm font-medium text-slate-700">
                  % Veículos Multados que Geram NIC
                  <span className="text-xs text-slate-500 ml-2">
                    (Notificação de Indicação de Condutor - apenas CNPJ)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="percentualNICs"
                    type="number"
                    value={percentualNICs}
                    onChange={(e) => {
                      const valor = Number(e.target.value)
                      setPercentualNICs(valor)
                    }}
                    className="text-lg pr-8 border-slate-300 focus:border-blue-500"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Percentual de veículos multados que não têm condutor indicado, gerando NIC (valor padrão: 20%)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Pagamento com Desconto</Label>
                <Select value={String(reducaoLW)} onValueChange={(value) => setReducaoLW(Number(value))}>
                  <SelectTrigger className="w-full text-lg border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Selecione o desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">Pagamento com 20% Desconto</SelectItem>
                    <SelectItem value="40">Pagamento com 40% Desconto</SelectItem>
                  </SelectContent>
                </Select>
                {reducaoLW === 40 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Obs: Os 40% de desconto são aplicados via SNE (Sistema de Notificação Eletrônica) a depender do
                    órgão.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket" className="text-sm font-medium text-slate-700">
                  Ticket Médio por Multa
                </Label>
                <div className="relative">
                  <Input
                    id="ticket"
                    type="number"
                    value={ticketMedio}
                    onChange={(e) => {
                      const valor = Number(e.target.value)
                      setTicketMedio(valor)
                    }}
                    className="text-lg pl-12 border-slate-300 focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                    R$
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custo" className="text-sm font-medium text-slate-700">
                  Investimento por Placa/Mês
                  <span className="text-xs text-slate-500 ml-2">
                    (A partir de {formatCurrency(planos[planoSelecionado as keyof typeof planos].valorMinimo)} para o
                    plano {planos[planoSelecionado as keyof typeof planos].nome})
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="custo"
                    type="number"
                    value={custoPlaca}
                    min={planos[planoSelecionado as keyof typeof planos].valorMinimo}
                    onChange={(e) => {
                      const valor = Number(e.target.value)
                      if (valor >= planos[planoSelecionado as keyof typeof planos].valorMinimo) {
                        setCustoPlaca(valor)
                      }
                    }}
                    className="text-lg pl-12 border-slate-300 focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                    R$
                  </span>
                </div>
                {custoPlaca < planos[planoSelecionado as keyof typeof planos].valorMinimo && (
                  <p className="text-xs text-red-500">
                    Valor mínimo para o plano {planos[planoSelecionado as keyof typeof planos].nome} é{" "}
                    {formatCurrency(planos[planoSelecionado as keyof typeof planos].valorMinimo)}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700">Escolha seu Plano LW Multas</Label>
                <div className="grid gap-3">
                  {Object.entries(planos).map(([key, plano]) => (
                    <div
                      key={key}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        planoSelecionado === key
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      onClick={() => handlePlanoChange(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${plano.cor}`}></div>
                          <span className="font-bold text-lg text-slate-800">{plano.nome}</span>
                          <span className="text-sm text-slate-500">
                            (a partir de {formatCurrency(plano.valorMinimo)})
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            planoSelecionado === key ? "bg-blue-500 border-blue-500" : "border-slate-300"
                          }`}
                        >
                          {planoSelecionado === key && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                      <p className="font-medium text-slate-800 mb-1">{plano.descricao}</p>
                      <p className="text-sm text-slate-600">{plano.detalhes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Retorno Simulação de Ganho Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex flex-col">
                      <span className="font-medium text-red-800">Pagando sem a LW:</span>
                      <span className="text-xs text-red-600 italic">pagando no valor cheio</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(custoSemLW)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex flex-col">
                      <span className="font-medium text-green-800">Pagando com a LW:</span>
                      <span className="text-xs text-green-600 italic">pagamento com {reducaoLW}% de desconto</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(custoComLW)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-800">Desconto Pagamento com a LW:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(custoSemLW * (reducaoLW / 100))}
                    </span>
                  </div>

                  {(planoSelecionado === "plus" || planoSelecionado === "premium") && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">
                        💡 Benefício Indicando em tempo - Evitar NICs:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-orange-700">NICs Geradas/Mês:</span>
                          <span className="font-medium">{Math.round(nicsGeradas)} unidades</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700">Valor por NIC:</span>
                          <span className="font-medium">{formatCurrency(ticketMedio * 2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold text-orange-800">Economia com NICs Evitadas:</span>
                          <span className="font-bold text-orange-600">{formatCurrency(ganhoCustoNIC)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-300">
                    <span className="font-bold text-purple-800">Economia Mensal Total:</span>
                    <span className="text-xl font-bold text-purple-600">{formatCurrency(economia)}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">📊 Detalhamento da Economia:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Desconto Pagamento com a LW ({reducaoLW}%):</span>
                        <span className="font-medium">{formatCurrency(custoSemLW * (reducaoLW / 100))}</span>
                      </div>
                      {(planoSelecionado === "plus" || planoSelecionado === "premium") && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Benefício Indicando em tempo - Evitar NICs:</span>
                          <span className="font-medium">{formatCurrency(ganhoCustoNIC)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold text-slate-700">Total da Economia:</span>
                        <span className="font-bold text-purple-600">{formatCurrency(economia)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Retorno sobre Investimento (ROI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Investimento Mensal LW:</span>
                    <span className="text-lg font-semibold text-slate-800">{formatCurrency(investimentoTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
                    <span className="font-bold text-green-800">ROI Líquido Mensal:</span>
                    <span className="text-2xl font-bold text-green-700">{formatCurrency(roiLiquido)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                    <span className="font-bold text-blue-800">ROI Percentual:</span>
                    <span className="text-2xl font-bold text-blue-700">{formatPercent(roiPercentual)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
                <CardTitle>Projeção Anual</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Economia Anual:</span>
                    <span className="font-bold text-green-600">{formatCurrency(economia * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Investimento Anual:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(investimentoTotal * 12)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-slate-800">ROI Líquido Anual:</span>
                    <span className="font-bold text-green-700 text-lg">{formatCurrency(roiLiquido * 12)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção Final Personalizada */}
        <div className="mt-12">
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {dadosLead.nome}, pronto para economizar {formatCurrency(roiLiquido)} por mês?
              </h3>
              <p className="text-slate-600 mb-6">
                Com o plano LW MULTAS - {planos[planoSelecionado as keyof typeof planos].nome} da LW Tecnologia, você
                poderá {planos[planoSelecionado as keyof typeof planos].mensagemFinal} e ter um ROI de{" "}
                {formatPercent(roiPercentual)} sobre o investimento.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={encerrarSimulacao}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  Falar no WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://lwtecnologia.com.br", "_blank")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg font-semibold"
                >
                  Visitar Nosso Site
                </Button>
                <Button
                  onClick={encerrarSimulacao}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  Encerrar e Enviar Simulação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/lw-tecnologia-logo.png"
              alt="LW Tecnologia - Gestão Inteligente de Multas"
              className="h-16 object-contain"
            />
          </div>
          <div className="text-blue-200 space-y-2">
            <p className="font-semibold">LW TECNOLOGIA LTDA</p>
            <p>CNPJ: 25.462.472/0001-97</p>
            <p>Email: comercial@lwtecnologia.com.br</p>
            <p>Endereço Matriz Curitiba: R. XV de Novembro, 621 2º andar Centro, Curitiba PR, 80020-310</p>
            <p className="mt-4">© 2024 LW Tecnologia - Gestão Inteligente de Multas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
