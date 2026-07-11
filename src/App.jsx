import React, { useState, useEffect, useRef } from 'react';

// Model lists mapping
const PROVIDER_MODELS = {
  mock: [
    { value: 'mock-gpt-4o', label: 'Mock GPT-4o (Simulation)' },
    { value: 'mock-claude-3-5', label: 'Mock Claude 3.5 Sonnet (Simulation)' },
    { value: 'mock-gemini-2-5', label: 'Mock Gemini 2.5 Pro (Simulation)' }
  ],
  openai: [
    { value: 'gpt-4o', label: 'gpt-4o (GPT-4o flagship)' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Lightweight, fast)' },
    { value: 'o1-preview', label: 'o1-preview (Advanced reasoning)' },
    { value: 'o1-mini', label: 'o1-mini (Fast reasoning)' },
    { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
    { value: 'gpt-4', label: 'gpt-4' },
    { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' }
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet (Latest)' },
    { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku (Latest)' },
    { value: 'claude-3-opus-latest', label: 'Claude 3 Opus (Latest)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (v2)' },
    { value: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet (v1)' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
  ],
  gemini: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Stable Default)' },
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (Latest Flash)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Flagship Coding)' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Legacy)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Legacy)' }
  ],
  groq: [
    { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Llama 70B (Reasoning)' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
    { value: 'llama3-8b-8192', label: 'Llama 3 8B' },
    { value: 'llama3-70b-8192', label: 'Llama 3 70B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B' }
  ],
  openrouter: [
    { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Reasoning)' },
    { value: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (Free)' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Chat)' },
    { value: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B Instruct (Free)' },
    { value: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B (Free)' },
    { value: 'microsoft/phi-3-medium-128k-instruct:free', label: 'Phi-3 Medium (Free)' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (via OpenRouter)' },
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (via OpenRouter)' },
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    { value: 'qwen/qwen-2.5-coder-32b-instruct:free', label: 'Qwen 2.5 Coder 32B (Free)' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (via OpenRouter)' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (via OpenRouter)' }
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek-V3 (Chat)' },
    { value: 'deepseek-reasoner', label: 'DeepSeek-R1 (Reasoning)' }
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large (Flagship)' },
    { value: 'mistral-small-latest', label: 'Mistral Small (Fast)' },
    { value: 'codestral-latest', label: 'Codestral (Coding)' },
    { value: 'open-mistral-nemo', label: 'Mistral Nemo (12B)' }
  ],
  cohere: [
    { value: 'command-r-plus', label: 'Command R+ (RAG-optimized)' },
    { value: 'command-r', label: 'Command R' }
  ],
  ollama: [
    { value: 'deepseek-r1', label: 'DeepSeek R1 (Local)' },
    { value: 'llama3', label: 'Llama 3 (Local)' },
    { value: 'mistral', label: 'Mistral (Local)' },
    { value: 'phi3', label: 'Phi 3 (Local)' },
    { value: 'qwen2.5-coder', label: 'Qwen 2.5 Coder (Local)' }
  ]
};

// UI Translations Registry
const TRANSLATIONS = {
  en: {
    status_ready: "Ready to Validate",
    eyebrow_credentials: "01 / Credentials",
    title_credentials: "Configure Provider",
    subtitle_credentials: "Select a model vendor and input your credential parameters.",
    label_provider: "Model Provider",
    label_api_key: "API Secret Key",
    label_model: "Model Name",
    btn_custom_model: "Custom Model",
    label_custom_model: "Custom Model Name",
    params_header: "Advanced Parameters",
    label_temp: "Temperature",
    label_max_tokens: "Max Return Tokens",
    label_system_prompt: "System Prompt",
    btn_validate: "Validate Credentials",
    btn_verifying: "Verifying Authenticity...",
    eyebrow_telemetry: "02 / Diagnostic Console",
    title_telemetry: "Telemetry & Metrics",
    subtitle_telemetry: "Real-time feedback from the provider endpoints.",
    label_status: "Status",
    label_latency: "Latency",
    label_usage: "Token Usage",
    locked_title: "Sandbox Playground Locked",
    locked_text: "Successfully validate an API Secret Key in Section 01 to initialize the real-time chat interface.",
    eyebrow_playground: "03 / Unified Playground",
    title_playground: "Playground Sandbox",
    btn_reset: "Reset Chat",
    chat_welcome: "Unified model sandbox initiated. Type a prompt below to interact with the model in real time.",
    chat_placeholder: "Send a message to the model...",
    chat_reset_msg: "Unified model sandbox reset. Ready for inputs.",
    modal_title: "How to Use TestKeyAPI",
    modal_step1_title: "Select a Provider",
    modal_step1_text: "Choose from 10 supported AI providers, including OpenAI, Anthropic, Gemini, Groq, or use the default Mock Sandbox to instantly run tests without keys.",
    modal_step2_title: "Authenticate Securely",
    modal_step2_text: "Enter your API key. For security, keys are processed strictly in-memory client-side and proxied via your local Express server, keeping credentials off local disk logs.",
    modal_step3_title: "Run Telemetry checks",
    modal_step3_text: "Click Validate Credentials to send a ping. A timer starts immediately to track response latency. Telemetry gauges show validity status and token usage.",
    modal_step4_title: "Playground Testing",
    modal_step4_text: "Once validation returns a success, the Playground Sandbox unlocks. Adjust system prompts or temperature sliders and chat with the model in real time.",
    modal_btn_close: "Acknowledge & Close"
  },
  km: {
    status_ready: "រួចរាល់សម្រាប់ការផ្ទៀងផ្ទាត់",
    eyebrow_credentials: "01 / ព័ត៌មានសម្ងាត់",
    title_credentials: "កំណត់រចនាសម្ព័ន្ធអ្នកផ្តល់សេវា",
    subtitle_credentials: "ជ្រើសរើសអ្នកផ្តល់សេវាគំរូ និងបញ្ចូលប៉ារ៉ាម៉ែត្រព័ត៌មានសម្ងាត់របស់អ្នក។",
    label_provider: "អ្នកផ្តល់សេវាគំរូ",
    label_api_key: "កូនសោសម្ងាត់ API",
    label_model: "ឈ្មោះគំរូ",
    btn_custom_model: "គំរូផ្ទាល់ខ្លួន",
    label_custom_model: "ឈ្មោះគំរូផ្ទាល់ខ្លួន",
    params_header: "ប៉ារ៉ាម៉ែត្រកម្រិតខ្ពស់",
    label_temp: "សីតុណ្ហភាព (Temperature)",
    label_max_tokens: "ចំនួនថូខឹនអតិបរមា",
    label_system_prompt: "សារណែនាំប្រព័ន្ធ (System Prompt)",
    btn_validate: "ផ្ទៀងផ្ទាត់ព័ត៌មានសម្ងាត់",
    btn_verifying: "កំពុងផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវ...",
    eyebrow_telemetry: "02 / កុងសូលវិនិច្ឆ័យ",
    title_telemetry: "ទិន្នន័យពីចម្ងាយ & រង្វាស់",
    subtitle_telemetry: "មតិត្រឡប់តាមពេលវេលាជាក់ស្តែងពីអ្នកផ្តល់សេវា។",
    label_status: "ស្ថានភាព",
    label_latency: "ភាពយឺតយ៉ាវ (Latency)",
    label_usage: "ការប្រើប្រាស់ថូខឹន",
    locked_title: "សួនកុមារសាកល្បងត្រូវបានចាក់សោ",
    locked_text: "ផ្ទៀងផ្ទាត់កូនសោសម្ងាត់ API ដោយជោគជ័យក្នុងផ្នែកទី 01 ដើម្បីចាប់ផ្តើមចំណុចប្រទាក់ជជែកកម្សាន្ត។",
    eyebrow_playground: "03 / សួនកុមាររួម",
    title_playground: "សួនកុមារសាកល្បង",
    btn_reset: "សម្អាតការសន្ទនា",
    chat_welcome: "សួនកុមារសាកល្បងគំរូរួមត្រូវបានចាប់ផ្តើម។ វាយបញ្ចូលសារខាងក្រោមដើម្បីប្រាស្រ័យទាក់ទងគ្នា។",
    chat_placeholder: "ផ្ញើសារទៅកាន់គំរូ...",
    chat_reset_msg: "សួនកុមារសាកល្បងគំរូត្រូវបានសម្អាតឡើងវិញ។ រួចរាល់សម្រាប់ការបញ្ចូលសារ។",
    modal_title: "របៀបប្រើប្រាស់ TestKeyAPI",
    modal_step1_title: "ជ្រើសរើសអ្នកផ្តល់សេវា",
    modal_step1_text: "ជ្រើសរើសពីអ្នកផ្តល់សេវា AI ដែលគាំទ្រចំនួន 10 រួមទាំង OpenAI, Anthropic, Gemini, Groq ឬប្រើ Mock Sandbox សម្រាប់ការសាកល្បងភ្លាមៗដោយគ្មានកូនសោ។",
    modal_step2_title: "ផ្ទៀងផ្ទាត់ដោយសុវត្ថិភាព",
    modal_step2_text: "បញ្ចូលកូនសោ API របស់អ្នក។ ដើម្បីសុវត្ថិភាព កូនសោត្រូវបានដំណើរការតែនៅក្នុងអង្គចងចាំរបស់កម្មវិធីរុករកតាមអ៊ីនធឺណិត និងឆ្លងកាត់ម៉ាស៊ីនមេ Express មូលដ្ឋានរបស់អ្នកប៉ុណ្ណោះ។",
    modal_step3_title: "ដំណើរការការត្រួតពិនិត្យទិន្នន័យ",
    modal_step3_text: "ចុចប៊ូតុង ផ្ទៀងផ្ទាត់ព័ត៌មានសម្ងាត់ ដើម្បីផ្ញើសារសាកល្បង។ ឧបករណ៍វាស់ស្ទង់នឹងបង្ហាញស្ថានភាពសុពលភាព និងការប្រើប្រាស់ថូខឹន។",
    modal_step4_title: "ការសាកល្បងលើសួនកុមារ",
    modal_step4_text: "នៅពេលការផ្ទៀងផ្ទាត់ជោគជ័យ សួនកុមារសាកល្បងនឹងបើកចាក់សោ។ កែសម្រួលសារណែនាំប្រព័ន្ធ ឬសីតុណ្ហភាព ហើយជជែកជាមួយគំរូតាមពេលវេលាជាក់ស្តែង។",
    modal_btn_close: "យល់ព្រម & បិទ"
  },
  es: {
    status_ready: "Listo para Validar",
    eyebrow_credentials: "01 / Credenciales",
    title_credentials: "Configure Proveedor",
    subtitle_credentials: "Seleccione un proveedor de modelos e ingrese sus parámetros de acceso.",
    label_provider: "Proveedor de Modelos",
    label_api_key: "Clave Secreta API",
    label_model: "Nombre del Modelo",
    btn_custom_model: "Modelo Personalizado",
    label_custom_model: "Nombre de Modelo Personalizado",
    params_header: "Parámetros Avanzados",
    label_temp: "Temperatura",
    label_max_tokens: "Tokens Máximos",
    label_system_prompt: "Instrucción del Sistema",
    btn_validate: "Validar Credenciales",
    btn_verifying: "Verificando Autenticidad...",
    eyebrow_telemetry: "02 / Consola de Diagnóstico",
    title_telemetry: "Telemetría y Métricas",
    subtitle_telemetry: "Respuesta en tiempo real de los extremos del proveedor.",
    label_status: "Estado",
    label_latency: "Latencia",
    label_usage: "Tokens Usados",
    locked_title: "Entorno de Prueba Bloqueado",
    locked_text: "Valide con éxito una clave secreta API en la sección 01 para iniciar la interfaz de chat en tiempo real.",
    eyebrow_playground: "03 / Entorno Unificado",
    title_playground: "Entorno de Pruebas de Chat",
    btn_reset: "Reiniciar Chat",
    chat_welcome: "Entorno de pruebas unificado iniciado. Escriba un mensaje a continuación para interactuar en tiempo real.",
    chat_placeholder: "Envíe un mensaje al modelo...",
    chat_reset_msg: "Historial de chat restablecido. Listo para recibir mensajes.",
    modal_title: "Cómo usar TestKeyAPI",
    modal_step1_title: "Seleccionar Proveedor",
    modal_step1_text: "Elija entre 10 proveedores soportados como OpenAI, Anthropic, Gemini, Groq, o use Mock Sandbox para probar al instante sin clave.",
    modal_step2_title: "Autenticación Segura",
    modal_step2_text: "Ingrese su clave. Se procesa en memoria del navegador y se proxy a través de su servidor local, sin guardarse en logs del sistema.",
    modal_step3_title: "Inspección de Telemetría",
    modal_step3_text: "Haga clic en Validar. Se inicia un temporizador para medir la latencia y se renderiza el payload JSON de respuesta.",
    modal_step4_title: "Pruebas de Chat",
    modal_step4_text: "Tras la validación exitosa, el chat se desbloquea. Ajuste la temperatura o system prompts y chatee con el modelo en tiempo real.",
    modal_btn_close: "Entendido y Cerrar"
  },
  zh: {
    status_ready: "准备验证",
    eyebrow_credentials: "01 / 凭证配置",
    title_credentials: "配置服务商",
    subtitle_credentials: "选择模型提供商并输入相关的凭证参数。",
    label_provider: "模型服务商",
    label_api_key: "API 密钥 (Secret Key)",
    label_model: "模型名称",
    btn_custom_model: "自定义模型",
    label_custom_model: "自定义模型名称",
    params_header: "高级参数配置",
    label_temp: "采样温度 (Temperature)",
    label_max_tokens: "最大输出 Token",
    label_system_prompt: "系统提示词",
    btn_validate: "验证凭证",
    btn_verifying: "正在验证身份...",
    eyebrow_telemetry: "02 / 诊断控制台",
    title_telemetry: "遥测与性能指标",
    subtitle_telemetry: "来自提供商接口的实时响应指标反馈。",
    label_status: "验证状态",
    label_latency: "网络延迟",
    label_usage: "Token 使用量",
    locked_title: "沙盒测试区已锁定",
    locked_text: "请先在第 01 步中成功验证一个 API 密钥以激活实时对话沙盒界面。",
    eyebrow_playground: "03 / 统一沙盒测试",
    title_playground: "对话沙盒测试区",
    btn_reset: "重置对话",
    chat_welcome: "统一模型对话测试已启动。在下方输入提示词以开始进行实时交互测试。",
    chat_placeholder: "输入给模型的消息...",
    chat_reset_msg: "多轮对话沙盒已重置，准备接收新指令。",
    modal_title: "如何使用 TestKeyAPI",
    modal_step1_title: "选择提供商",
    modal_step1_text: "从支持的 10 个 AI 提供商（如 OpenAI、Anthropic、Gemini、Groq 等）中进行选择，或直接使用 Mock 沙盒进行无密钥快速体验。",
    modal_step2_title: "安全身份验证",
    modal_step2_text: "输入您的密钥。出于安全原因，密钥仅驻留在客户端内存中，通过本地部署的 Node 服务做代理中转，不会在磁盘日志中留下凭证记录。",
    modal_step3_title: "运行延迟遥测",
    modal_step3_text: "点击验证凭证开始测试连接。定时器将实时记录接口延迟毫秒数，诊断控制台会同时输出 API 返回的 JSON 完整报文。",
    modal_step4_title: "沙盒对话交互",
    modal_step4_text: "连接验证通过后沙盒会自动解锁。您可以调整系统角色定义或随机温度，并直接与已选择的模型进行多轮对话测试。",
    modal_btn_close: "我知道了，关闭引导"
  },
  ja: {
    status_ready: "検証準備完了",
    eyebrow_credentials: "01 / 認証情報の設定",
    title_credentials: "プロバイダーの設定",
    subtitle_credentials: "AIモデルのプロバイダーを選択し、APIキー等の認証パラメータを入力します。",
    label_provider: "AIプロバイダー",
    label_api_key: "APIシークレットキー",
    label_model: "モデル名",
    btn_custom_model: "カスタムモデル",
    label_custom_model: "カスタムモデル名",
    params_header: "詳細パラメータ設定",
    label_temp: "ランダム性",
    label_max_tokens: "最大トークン数",
    label_system_prompt: "システムプロンプト",
    btn_validate: "接続を検証する",
    btn_verifying: "認証検証中...",
    eyebrow_telemetry: "02 / 診断コンソール",
    title_telemetry: "テレメトリと各種メトリクス",
    subtitle_telemetry: "プロバイダーエンドポイントからのリアルタイムなテレメトリ情報。",
    label_status: "検証ステータス",
    label_latency: "応答速度 (Latency)",
    label_usage: "消費トークン量",
    locked_title: "対話用サンドボックスはロックされています",
    locked_text: "セクション 01 で API シークレットキーの検証に成功すると、リアルタイムチャットインターフェースがアンロックされます。",
    eyebrow_playground: "03 / 統一サンドボックス",
    title_playground: "サンドボックス・プレイグラウンド",
    btn_reset: "履歴をクリア",
    chat_welcome: "統一モデルサンドボックスが起動しました。以下にプロンプトを入力して、リアルタイムで対話を開始します。",
    chat_placeholder: "モデルへ送るメッセージを入力...",
    chat_reset_msg: "対話履歴クリア。新しいメッセージを入力してください。",
    modal_title: "TestKeyAPI の使い方",
    modal_step1_title: "プロバイダーの選択",
    modal_step1_text: "OpenAI、Anthropic、Gemini、Groqなど、対応している 10 個のプロバイダーから選択するか、キーが不要な Mock サンドボックスで即座に機能をテストします。",
    modal_step2_title: "安全なキー認証",
    modal_step2_text: "APIキーを入力します。キーはブラウザのメモリ内でのみ保持され、ローカルのExpressプロキシ経由で送信されるため、ディスクログに記録されることはありません。",
    modal_step3_title: "テレメトリ診断の実行",
    modal_step3_text: "接続検証ボタンをクリックします。ミリ秒単位のタイマーが応答時間を追跡し、取得した生のレスポンスJSONデータをデベロッパーコンソールに表示します。",
    modal_step4_title: "対話プレイグラウンド",
    modal_step4_text: "認証が成功すると、チャットエリアが利用可能になります。システム指示や温度パラメータを変更しながら、モデルと直接対話を行えます。",
    modal_btn_close: "了解して閉じる"
  }
};

function App() {
  // UI Translation Language
  const [lang, setLang] = useState('en');
  // Visual Theme State
  const [theme, setTheme] = useState('violet');
  // Stage Routing State ('config' or 'sandbox')
  const [page, setPage] = useState('config');

  // Configuration States
  const [provider, setProvider] = useState('mock');
  const [apiKey, setApiKey] = useState('mock-key');
  const [model, setModel] = useState('mock-gpt-4o');
  const [customModel, setCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
  
  // Advanced Parameters States
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Status & UI States
  const [keyVisible, setKeyVisible] = useState(false);
  const [paramsExpanded, setParamsExpanded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  
  // Telemetry States
  const [telemetry, setTelemetry] = useState({ status: '—', latency: '—', usage: '—' });
  const [consoleOutput, setConsoleOutput] = useState('// Telemetry logs will appear here after validation request is sent.');
  const [lastPayload, setLastPayload] = useState(null);

  // Chat Playgrounds States
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Modals Visibility
  const [showDocs, setShowDocs] = useState(false);

  // Refs for UI scroll positioning
  const chatMessagesRef = useRef(null);
  const chatInputRef = useRef(null);

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

  // Auto Scroll Chat Window
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isSendingChat]);

  // Sync Default key configurations based on provider selects
  const handleProviderChange = (e) => {
    const p = e.target.value;
    setProvider(p);
    setIsValidated(false);

    // Set first model from provider list as default
    const defaults = PROVIDER_MODELS[p] || [];
    if (defaults.length > 0) {
      setModel(defaults[0].value);
    }

    if (p === 'mock') {
      setApiKey('mock-key');
    } else if (p === 'ollama') {
      setApiKey('ollama');
    } else {
      setApiKey('');
    }
  };

  // Run Credential Validation Check
  const validateCredentials = async (e) => {
    e.preventDefault();
    if (!apiKey) return;

    const activeModel = customModel ? customModelName.trim() : model;
    if (!activeModel) return;

    setIsVerifying(true);
    setTelemetry({ status: 'VALIDATING', latency: '...', usage: '...' });
    setConsoleOutput('// Routing credentials to verification endpoint...\n// Making test request to check key validity...');

    let elapsed = 0;
    const startTimer = Date.now();
    const timerInterval = setInterval(() => {
      elapsed = Date.now() - startTimer;
      setTelemetry(prev => ({ ...prev, latency: `${elapsed}ms` }));
    }, 55);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model: activeModel
        })
      });

      const data = await response.json();
      clearInterval(timerInterval);

      if (data.success) {
        setIsValidated(true);
        setLastPayload(data);
        setTelemetry({
          status: 'VALID',
          latency: `${data.latency}ms`,
          usage: formatTokenUsage(data.usage)
        });
        setConsoleOutput(JSON.stringify(data, null, 2));

        // Insert first system notification bubble in playground chat
        setChatHistory([
          {
            role: 'system',
            content: `Model credentials verified. Playground active. API returned response: "${data.response}"`
          }
        ]);

        // Auto transition to Sandbox page after short latency simulation
        setTimeout(() => {
          setPage('sandbox');
        }, 800);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      clearInterval(timerInterval);
      setIsValidated(false);
      setLastPayload({ error: error.message });
      setTelemetry({ status: 'INVALID', latency: 'ERR', usage: '—' });
      setConsoleOutput(`// Verification Failed:\n${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Run Chat completions request
  const sendChatMessage = async (e) => {
    e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || isSendingChat || !isValidated) return;

    setChatInput('');
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
    }

    // Append user bubble to state
    const newHistory = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newHistory);
    setIsSendingChat(true);

    const startTimer = Date.now();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model: customModel ? customModelName.trim() : model,
          messages: newHistory.filter(msg => msg.role !== 'system'),
          temperature: Number(temp),
          maxTokens: maxTokens ? Number(maxTokens) : null,
          systemPrompt: systemPrompt.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        const elapsed = Date.now() - startTimer;
        setTelemetry({
          status: 'ACTIVE',
          latency: `${elapsed}ms`,
          usage: formatTokenUsage(data.usage)
        });
        setConsoleOutput(JSON.stringify(data, null, 2));

        // Append assistant response to chat logs
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setConsoleOutput(`// Request Error:\n${error.message}`);
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Error executing request: ${error.message}`, error: true }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Copy JSON Payload to clipboard helper
  const handleCopyPayload = () => {
    if (lastPayload) {
      navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2));
    }
  };

  const handleResetChat = () => {
    setChatHistory([]);
  };

  const formatTokenUsage = (usage) => {
    if (!usage) return '—';
    if (typeof usage === 'number') return `${usage}`;
    const input = usage.promptTokens ?? usage.prompt_tokens ?? usage.input_tokens ?? 0;
    const output = usage.candidatesTokens ?? usage.completion_tokens ?? usage.output_tokens ?? 0;
    const total = usage.totalTokens ?? usage.total_tokens ?? (input + output);
    return total > 0 ? `${total}` : '—';
  };

  // Regular expression parsing for markdown bubbles formatting
  const formatMarkdown = (text) => {
    if (!text) return '';
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Code blocks: ```code```
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
    });
    
    // Inline code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
    
    // Bold: **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points list
    formatted = formatted.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Linebreaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return { __html: formatted };
  };

  return (
    <div className={`theme-${theme}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ambient background mesh gradients */}
      <div className="mesh-background">
        <div className="orb orb-violet"></div>
        <div className="orb orb-emerald"></div>
        <div className="orb orb-indigo"></div>
      </div>
      <div className="noise-overlay"></div>

      <main className="app-container">
        {/* Header Navigation Pill */}
        <header className="header-nav">
          <div className="logo">
            <img src="/logo2.png" className="logo-img" alt="Logo" />
            <span>TestKeyAPI</span>
          </div>
          
          <div className="header-controls">
            <div className="theme-select-wrapper">
              <i className="ph-light ph-palette"></i>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} title="Change Theme">
                <option value="violet">🔮 Violet</option>
                <option value="emerald">🍃 Emerald</option>
                <option value="sapphire">💧 Sapphire</option>
                <option value="crimson">🌹 Crimson</option>
                <option value="amber">🔥 Amber</option>
              </select>
              <i className="ph-light ph-caret-down lang-caret"></i>
            </div>

            <div className="lang-select-wrapper">
              <i className="ph-light ph-translate"></i>
              <select value={lang} onChange={(e) => setLang(e.target.value)} title="Change Language">
                <option value="en">🇬🇧 EN</option>
                <option value="km">🇰🇭 KM</option>
                <option value="es">🇪🇸 ES</option>
                <option value="zh">🇨🇳 ZH</option>
                <option value="ja">🇯🇵 JA</option>
              </select>
              <i className="ph-light ph-caret-down lang-caret"></i>
            </div>
            
            <button className="icon-btn-circle" onClick={() => setShowDocs(true)} title="View Instructions">
              <i className="ph-light ph-question"></i>
            </button>
          </div>

          <div className="status-indicator-pill">
            <span className={`pulse-dot ${isValidated ? 'active' : telemetry.status === 'INVALID' ? 'error' : ''}`}></span>
            <span>
              {isValidated 
                ? `${t('status_ready')} (${provider.toUpperCase()})` 
                : t(telemetry.status === 'INVALID' ? 'Authentication Failed' : 'status_ready')
              }
            </span>
          </div>
        </header>

        {page === 'sandbox' ? (
          /* Sandbox Playground Page (Spacious layout) */
          <div className="bento-grid animate-fade-in">
            {/* Playpen Chat Section */}
            <section className="bento-card double-bezel col-span-8" id="chat-section" style={{ minHeight: '620px' }}>
              <div className="inner-core flex-column relative-container">
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-model-info">
                    <span className="eyebrow-tag">{t('eyebrow_playground')}</span>
                    <h2>{customModel ? customModelName : `${provider.toUpperCase()} // ${model}`}</h2>
                  </div>
                  <div className="chat-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setPage('config')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="ph-light ph-sliders"></i> {t('title_credentials')}
                    </button>
                    <button onClick={handleResetChat} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="ph-light ph-trash"></i> {t('btn_reset')}
                    </button>
                  </div>
                </div>

                {/* Chat Message Logs */}
                <div className="chat-messages-container" ref={chatMessagesRef} style={{ maxHeight: '420px', minHeight: '350px' }}>
                  {chatHistory.length === 0 ? (
                    <div className="system-message-card">
                      <i className="ph-light ph-info"></i>
                      <span>{t('chat_welcome')}</span>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`message-bubble ${msg.role}`}>
                        <div className="msg-info">
                          {msg.role === 'assistant' ? (customModel ? customModelName : model) : msg.role === 'system' ? 'System' : 'User'}
                        </div>
                        <div 
                          className={`msg-content ${msg.error ? 'error-msg' : ''}`}
                          dangerouslySetInnerHTML={formatMarkdown(msg.content)}
                        />
                      </div>
                    ))
                  )}

                  {isSendingChat && (
                    <div className="message-bubble assistant">
                      <div className="msg-info">{customModel ? customModelName : model}</div>
                      <div className="msg-content">
                        <div className="typing-loader">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="chat-input-bar">
                  <form onSubmit={sendChatMessage} className="chat-form">
                    <div className="chat-input-wrapper">
                      <textarea 
                        ref={chatInputRef}
                        value={chatInput} 
                        onChange={(e) => {
                          setChatInput(e.target.value);
                          if (chatInputRef.current) {
                            chatInputRef.current.style.height = 'auto';
                            chatInputRef.current.style.height = (chatInputRef.current.scrollHeight - 10) + 'px';
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage(e);
                          }
                        }}
                        placeholder={t('chat_placeholder')}
                        rows="1" 
                        required 
                      />
                      <button type="submit" className="send-btn" title="Send Message" disabled={isSendingChat}>
                        <i className="ph-light ph-paper-plane-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* Right Side Telemetry & Logs */}
            <section className="bento-card double-bezel col-span-4 animate-fade-in delay-100">
              <div className="inner-core flex-column h-full" style={{ gap: '1.25rem' }}>
                <div>
                  <span className="eyebrow-tag">{t('eyebrow_telemetry')}</span>
                  <h3 className="section-title" style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{t('title_telemetry')}</h3>
                  <p className="section-subtitle">{t('subtitle_telemetry')}</p>
                </div>

                <div className="telemetry-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div className="telemetry-item" style={{ padding: '0.8rem 1.25rem' }}>
                    <div className="telemetry-label">{t('label_status')}</div>
                    <div className={`telemetry-value ${telemetry.status === 'VALID' || telemetry.status === 'ACTIVE' ? 'active' : telemetry.status === 'INVALID' ? 'error' : ''}`} style={{ fontSize: '1.1rem' }}>
                      {telemetry.status}
                    </div>
                  </div>
                  <div className="telemetry-item" style={{ padding: '0.8rem 1.25rem' }}>
                    <div className="telemetry-label">{t('label_latency')}</div>
                    <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>{telemetry.latency}</div>
                  </div>
                  <div className="telemetry-item" style={{ padding: '0.8rem 1.25rem' }}>
                    <div className="telemetry-label">{t('label_usage')}</div>
                    <div className="telemetry-value" style={{ fontSize: '1.1rem' }}>{telemetry.usage}</div>
                  </div>
                </div>

                <div className="console-box" style={{ minHeight: '180px', flexGrow: 1 }}>
                  <div className="console-header">
                    <span><i className="ph-light ph-terminal"></i> payload.json</span>
                    <button onClick={handleCopyPayload} className="icon-btn" title="Copy Payload" disabled={!lastPayload}>
                      <i className="ph-light ph-copy"></i>
                    </button>
                  </div>
                  <pre className="console-content" style={{ maxHeight: '250px', fontSize: '0.75rem', color: '#7ed6ff' }}>
                    <code>{consoleOutput}</code>
                  </pre>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Configuration Setup Page (Original Left/Right Bento columns) */
          <div className="bento-grid animate-fade-in">
            {/* Bento Block 1: Credentials & Configuration */}
            <section className="bento-card double-bezel col-span-5">
              <div className="inner-core">
                <div className="card-header">
                  <span className="eyebrow-tag">{t('eyebrow_credentials')}</span>
                  <h2 className="section-title">{t('title_credentials')}</h2>
                  <p className="section-subtitle">{t('subtitle_credentials')}</p>
                </div>

                <form onSubmit={validateCredentials} className="config-form">
                  <div className="input-group">
                    <label htmlFor="provider-select">{t('label_provider')}</label>
                    <div className="select-wrapper">
                      <i className="ph-light ph-cpu input-icon"></i>
                      <select id="provider-select" value={provider} onChange={handleProviderChange} required>
                        <option value="mock">Mock Sandbox (No Key Required)</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="groq">Groq</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="deepseek">DeepSeek (Direct)</option>
                        <option value="mistral">Mistral AI</option>
                        <option value="cohere">Cohere</option>
                        <option value="ollama">Ollama (Local)</option>
                      </select>
                      <i className="ph-light ph-caret-down select-caret"></i>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="api-key-input">{t('label_api_key')}</label>
                    <div className="input-wrapper">
                      <i className="ph-light ph-key-return input-icon"></i>
                      <input 
                        type={keyVisible ? 'text' : 'password'} 
                        id="api-key-input" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'mock' ? 'Not required (using simulated test key)' : provider === 'ollama' ? 'Not required (using local Ollama)' : 'sk-...'} 
                        required={provider !== 'mock' && provider !== 'ollama'}
                        disabled={provider === 'mock' || provider === 'ollama'}
                        autoComplete="off" 
                      />
                      {provider !== 'mock' && provider !== 'ollama' && (
                        <button 
                          type="button" 
                          className="icon-btn" 
                          onClick={() => setKeyVisible(!keyVisible)} 
                          title="Toggle Visibility"
                        >
                          <i className={`ph-light ${keyVisible ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group w-full">
                      <label htmlFor="model-select">{t('label_model')}</label>
                      <div className="select-wrapper">
                        <i className="ph-light ph-sparkle input-icon"></i>
                        <select 
                          id="model-select" 
                          value={model} 
                          onChange={(e) => setModel(e.target.value)} 
                          disabled={customModel} 
                          required
                        >
                          {(PROVIDER_MODELS[provider] || []).map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <i className="ph-light ph-caret-down select-caret"></i>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className={`badge-btn ${customModel ? 'active' : ''}`}
                      onClick={() => setCustomModel(!customModel)}
                      title="Toggle Custom Model Input"
                    >
                      {t('btn_custom_model')}
                    </button>
                  </div>

                  {customModel && (
                    <div className="input-group animate-fade-in">
                      <label htmlFor="custom-model-input">{t('label_custom_model')}</label>
                      <div className="input-wrapper">
                        <i className="ph-light ph-terminal-window input-icon"></i>
                        <input 
                          type="text" 
                          id="custom-model-input" 
                          value={customModelName}
                          onChange={(e) => setCustomModelName(e.target.value)}
                          placeholder="e.g., gpt-4o-2024-11-20"
                          required={customModel}
                        />
                      </div>
                    </div>
                  )}

                  {/* Collapsible advanced parameters */}
                  <div className="parameters-section">
                    <button 
                      type="button" 
                      className={`params-header ${paramsExpanded ? 'expanded' : ''}`}
                      onClick={() => setParamsExpanded(!paramsExpanded)}
                    >
                      <span><i className="ph-light ph-sliders-horizontal"></i> {t('params_header')}</span>
                      <i className="ph-light ph-caret-down arrow-icon"></i>
                    </button>
                    
                    <div className={`params-body ${paramsExpanded ? '' : 'collapsed'}`}>
                      <div className="input-group">
                        <div className="slider-label-row">
                          <label htmlFor="temp-slider">{t('label_temp')}</label>
                          <span>{temp}</span>
                        </div>
                        <input 
                          type="range" 
                          id="temp-slider" 
                          min="0" 
                          max="2" 
                          step="0.1" 
                          value={temp} 
                          onChange={(e) => setTemp(parseFloat(e.target.value))} 
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="max-tokens-input">{t('label_max_tokens')}</label>
                        <div className="input-wrapper">
                          <i className="ph-light ph-hash input-icon"></i>
                          <input 
                            type="number" 
                            id="max-tokens-input" 
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(e.target.value)}
                            placeholder="Default (e.g. 1024)" 
                            min="1" 
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label htmlFor="system-prompt-input">{t('label_system_prompt')}</label>
                        <div className="input-wrapper">
                          <i className="ph-light ph-robot input-icon"></i>
                          <textarea 
                            id="system-prompt-input" 
                            rows="3" 
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="You are a helpful AI assistant."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={isVerifying}>
                    <span className="btn-text">
                      {isVerifying ? t('btn_verifying') : t('btn_validate')}
                    </span>
                    <span className="btn-icon-wrapper">
                      <i className={`ph-light ${isVerifying ? 'ph-spinner-gap spin-animation' : 'ph-arrow-right'}`}></i>
                    </span>
                  </button>
                </form>
              </div>
            </section>

            {/* Bento Block 2: Diagnostic Console */}
            <section className="bento-card double-bezel col-span-7">
              <div className="inner-core flex-column h-full">
                <div className="card-header">
                  <span className="eyebrow-tag">{t('eyebrow_telemetry')}</span>
                  <h2 className="section-title">{t('title_telemetry')}</h2>
                  <p className="section-subtitle">{t('subtitle_telemetry')}</p>
                </div>

                <div className="telemetry-grid">
                  <div className="telemetry-item">
                    <div className="telemetry-label">{t('label_status')}</div>
                    <div className={`telemetry-value ${telemetry.status === 'VALID' || telemetry.status === 'ACTIVE' ? 'active' : telemetry.status === 'INVALID' ? 'error' : ''}`}>
                      {telemetry.status}
                    </div>
                  </div>
                  <div className="telemetry-item">
                    <div className="telemetry-label">{t('label_latency')}</div>
                    <div className="telemetry-value">{telemetry.latency}</div>
                  </div>
                  <div className="telemetry-item">
                    <div className="telemetry-label">{t('label_usage')}</div>
                    <div className="telemetry-value">{telemetry.usage}</div>
                  </div>
                </div>

                <div className="console-box">
                  <div className="console-header">
                    <span><i className="ph-light ph-terminal"></i> response_payload.json</span>
                    <button 
                      onClick={handleCopyPayload} 
                      className="icon-btn" 
                      title="Copy Payload" 
                      disabled={!lastPayload}
                    >
                      <i className="ph-light ph-copy"></i>
                    </button>
                  </div>
                  <pre className="console-content">
                    <code>{consoleOutput}</code>
                  </pre>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Help & Onboarding Documentation Modal Overlay */}
      {showDocs && (
        <div className="modal-overlay active" onClick={() => setShowDocs(false)}>
          <div className="modal-card double-bezel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="inner-core">
              <div className="modal-header">
                <h2 className="modal-title"><i className="ph-light ph-book-open"></i> {t('modal_title')}</h2>
                <button className="icon-btn-circle" onClick={() => setShowDocs(false)} title="Close Documentation">
                  <i className="ph-light ph-x"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-step">
                  <div className="step-num">1</div>
                  <div className="step-details">
                    <h4>{t('modal_step1_title')}</h4>
                    <p>{t('modal_step1_text')}</p>
                  </div>
                </div>

                <div className="modal-step">
                  <div className="step-num">2</div>
                  <div className="step-details">
                    <h4>{t('modal_step2_title')}</h4>
                    <p>{t('modal_step2_text')}</p>
                  </div>
                </div>

                <div className="modal-step">
                  <div className="step-num">3</div>
                  <div className="step-details">
                    <h4>{t('modal_step3_title')}</h4>
                    <p>{t('modal_step3_text')}</p>
                  </div>
                </div>

                <div className="modal-step">
                  <div className="step-num">4</div>
                  <div className="step-details">
                    <h4>{t('modal_step4_title')}</h4>
                    <p>{t('modal_step4_text')}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDocs(false)}>
                  {t('modal_btn_close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
