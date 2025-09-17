"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useDataInsights } from "@/components/data-context";

// Tab icons
import { ClipboardList, Database, Settings, Share2 } from "lucide-react";

// Use Case Dropdown Icon
import { ChevronDown } from "lucide-react";

// Interfaces
interface DataConnectorProps {
  setMessage: (message: string | null) => void;
  setShowMessage: (show: boolean) => void;
}

interface UseCase {
  value: string;
  label: string;
}

interface Check {
  id: string;
  name: string;
  type: string;
  default_selected: boolean;
  disabled: boolean;
}

export function DataConnector({
  setMessage,
  setShowMessage,
}: DataConnectorProps) {
  const {
    dbConfig,
    setDbConfig,
    llmConfig,
    setLlmConfig,
    ragConfig,
    setRagConfig,
  } = useDataInsights();

  // Loading and error states
  const [databaseOptions, setDatabaseOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [availableLlmModels, setAvailableLlmModels] = useState<any | null>(
    null
  );
  const [llmLoading, setLlmLoading] = useState<boolean>(true);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmModelNameOptions, setLlmModelNameOptions] = useState<string[]>([]);
  const [generationModelOptions, setGenerationModelOptions] = useState<
    string[]
  >([]);

  const embeddingProviderOptions = ["Hugging Face", "OpenAI", "Cohere"];
  const vectorDBTypeOptions = [
    "Azure Cosmos DB",
    "Pinecone",
    "Weaviate",
    "Qdrant",
    "Chroma",
  ];

  // Use Case state
  const defaultUseCases: UseCase[] = [
    { value: "Dormant Analyzer", label: "Dormant Analyzer" },
    { value: "Operational Audit", label: "Operational Audit" },
    { value: "Compliance Audit", label: "Compliance Audit" },
    { value: "Internal Audit", label: "Internal Audit" },
  ];
  const [useCaseOptions, setUseCaseOptions] =
    useState<UseCase[]>(defaultUseCases);
  const [selectedUseCase, setSelectedUseCase] = useState<string>(
    defaultUseCases[0].value
  );

  const handleAddNewUseCase = () => {
    const newUseCaseName = window.prompt("Enter the name of the new Use Case:");
    if (newUseCaseName && newUseCaseName.trim() !== "") {
      const newUseCase = {
        value: newUseCaseName.trim(),
        label: newUseCaseName.trim(),
      };
      setUseCaseOptions([...useCaseOptions, newUseCase]);
      setSelectedUseCase(newUseCase.value);
    }
  };

  const [dormantChecks, setDormantChecks] = useState<Check[]>([
    {
      id: "select_all_dormant",
      name: "Select All Dormant Checks",
      type: "orchestrator",
      default_selected: false,
      disabled: false,
    },
    {
      id: "safe_deposit_dormancy",
      name: "Check Safe Deposit Dormancy",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "investment_inactivity",
      name: "Check Investment Inactivity",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "fixed_deposit_inactivity",
      name: "Check Fixed Deposit Inactivity",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "demand_deposit_inactivity",
      name: "Check Demand Deposit Inactivity",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "unclaimed_payment_instruments",
      name: "Check Unclaimed Payment Instruments",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "eligible_for_cb_transfer",
      name: "Check Eligible for CB Transfer",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "art3_process_needed",
      name: "Check Art3 Process Needed",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "contact_attempts_needed",
      name: "Check Contact Attempts Needed",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "high_value_dormant_accounts",
      name: "Check High Value Dormant Accounts",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "dormant_to_active_transitions",
      name: "Check Dormant to Active Transitions",
      type: "dormant_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "run_all_dormant_checks",
      name: "Run All Dormant Identification Checks (Orchestrator)",
      type: "orchestrator",
      default_selected: false,
      disabled: false,
    },
  ]);

  const [complianceChecks, setComplianceChecks] = useState<Check[]>([
    {
      id: "select_all_compliance",
      name: "Select All Compliance Checks",
      type: "orchestrator",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_incomplete_contact_attempts",
      name: "Detect Incomplete Contact Attempts",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_unflagged_dormant_candidates",
      name: "Detect Unflagged Dormant Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_internal_ledger_candidates",
      name: "Detect Internal Ledger Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_statement_freeze_candidates",
      name: "Detect Statement Freeze Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_cbuae_transfer_candidates",
      name: "Detect CBUAE Transfer Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_foreign_currency_conversion_needed",
      name: "Detect Foreign Currency Conversion Needed",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_sdb_court_application_needed",
      name: "Detect SDB Court Application Needed",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_unclaimed_payment_instruments_ledger",
      name: "Detect Unclaimed Payment Instruments Ledger",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_claim_processing_pending",
      name: "Detect Claim Processing Pending",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "generate_annual_cbuae_report_summary",
      name: "Generate Annual CBUAE Report Summary",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "check_record_retention_compliance",
      name: "Check Record Retention Compliance",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "log_flag_instructions",
      name: "Log Flag Instructions",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_flag_candidates",
      name: "Detect Flag Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_ledger_candidates",
      name: "Detect Ledger Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_freeze_candidates",
      name: "Detect Freeze Candidates",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "detect_transfer_candidates_to_cb",
      name: "Detect Transfer Candidates to CB",
      type: "compliance_check",
      default_selected: false,
      disabled: false,
    },
    {
      id: "run_all_compliance_checks",
      name: "Run All Compliance Checks (Orchestrator)",
      type: "orchestrator",
      default_selected: false,
      disabled: false,
    },
  ]);

  const handleSelectAllChecks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (selectedUseCase === "Dormant Analyzer") {
      setDormantChecks(
        dormantChecks.map((check) => ({
          ...check,
          default_selected: isChecked,
        }))
      );
    } else if (selectedUseCase === "Compliance Audit") {
      setComplianceChecks(
        complianceChecks.map((check) => ({
          ...check,
          default_selected: isChecked,
        }))
      );
    }
  };

  const handleSingleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    if (selectedUseCase === "Dormant Analyzer") {
      const updatedChecks = dormantChecks.map((check) =>
        check.id === id ? { ...check, default_selected: checked } : check
      );

      // Update the "Select All" checkbox state based on other checkboxes
      const allDormantChecked = updatedChecks.every(
        (check) => check.id === "select_all_dormant" || check.default_selected
      );

      setDormantChecks(
        updatedChecks.map((check) =>
          check.id === "select_all_dormant"
            ? { ...check, default_selected: allDormantChecked }
            : check
        )
      );
    } else if (selectedUseCase === "Compliance Audit") {
      const updatedChecks = complianceChecks.map((check) =>
        check.id === id ? { ...check, default_selected: checked } : check
      );

      // Update the "Select All" checkbox state based on other checkboxes
      const allComplianceChecked = updatedChecks.every(
        (check) =>
          check.id === "select_all_compliance" || check.default_selected
      );

      setComplianceChecks(
        updatedChecks.map((check) =>
          check.id === "select_all_compliance"
            ? { ...check, default_selected: allComplianceChecked }
            : check
        )
      );
    }
  };

  const handleSaveUseCase = () => {
    let selectedChecks;
    if (selectedUseCase === "Dormant Analyzer") {
      selectedChecks = dormantChecks
        .filter((check) => check.default_selected)
        .map((check) => check.id);
    } else if (selectedUseCase === "Compliance Audit") {
      selectedChecks = complianceChecks
        .filter((check) => check.default_selected)
        .map((check) => check.id);
    }
    console.log("Selected Use Case:", selectedUseCase);
    console.log("Selected Checks:", selectedChecks);
    setMessage("Use Case saved successfully!");
    setShowMessage(true);
  };

  // Section state (tabs)
  const [selectedSection, setSelectedSection] = useState<
    "usecase" | "database" | "llm" | "rag"
  >("usecase");

  // Fetch database types
  useEffect(() => {
    const fetchDatabaseTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "https://config-api-service-641805125303.us-central1.run.app/db/databases"
        );
        const data = response.data;
        if (
          data &&
          Array.isArray(data.databases) &&
          data.databases.every(
            (db: any) => typeof db === "object" && db !== null && "id" in db
          )
        ) {
          const ids = data.databases.map((db: any) => db.id);
          setDatabaseOptions(ids);
          if (ids.length > 0 && !dbConfig.databaseType) {
            setDbConfig((prev) => ({ ...prev, databaseType: ids[0] }));
          }
        } else {
          setError("Unexpected API response format or missing 'id' property.");
        }
      } catch (err: any) {
        setError(`Failed to load database types: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDatabaseTypes();
  }, [dbConfig.databaseType, setDbConfig]);

  // Fetch LLM models
  useEffect(() => {
    const fetchLlmModels = async () => {
      try {
        setLlmLoading(true);
        setLlmError(null);
        const response = await axios.get(
          "https://fastapi-rag-app-641805125303.us-central1.run.app/llm/available"
        );
        const data = response.data;
        if (data && data.available) {
          setAvailableLlmModels(data);
          const providers = Object.keys(data.available);

          if (providers.length > 0) {
            if (!llmConfig.llmProvider) {
              setLlmConfig((prev) => ({ ...prev, llmProvider: providers[0] }));
            }
            const initialModels =
              data.available[llmConfig.llmProvider || providers[0]];
            if (initialModels.length > 0 && !llmConfig.llmModelName) {
              setLlmConfig((prev) => ({
                ...prev,
                llmModelName: initialModels[0],
              }));
            }
            if (!ragConfig.generationLlmProvider) {
              setRagConfig((prev) => ({
                ...prev,
                generationLlmProvider: providers[0],
              }));
            }
            const initialGenModels =
              data.available[ragConfig.generationLlmProvider || providers[0]];
            if (initialGenModels.length > 0 && !ragConfig.generationModel) {
              setRagConfig((prev) => ({
                ...prev,
                generationModel: initialGenModels[0],
              }));
            }
          }
        } else {
          setLlmError("Unexpected API response format for LLM models.");
        }
      } catch (err: any) {
        setLlmError(`Failed to load LLM models: ${err.message}`);
      } finally {
        setLlmLoading(false);
      }
    };
    fetchLlmModels();
  }, [
    llmConfig.llmProvider,
    llmConfig.llmModelName,
    ragConfig.generationLlmProvider,
    ragConfig.generationModel,
    setLlmConfig,
    setRagConfig,
  ]);

  // Update LLM models when provider changes
  useEffect(() => {
    if (availableLlmModels && llmConfig.llmProvider) {
      const models = availableLlmModels.available[llmConfig.llmProvider] || [];
      setLlmModelNameOptions(models);
      if (models.length > 0 && !models.includes(llmConfig.llmModelName)) {
        setLlmConfig((prev) => ({ ...prev, llmModelName: models[0] }));
      } else if (models.length === 0) {
        setLlmConfig((prev) => ({ ...prev, llmModelName: "" }));
      }
    }
  }, [
    llmConfig.llmProvider,
    availableLlmModels,
    llmConfig.llmModelName,
    setLlmConfig,
  ]);

  // Update RAG models when generation provider changes
  useEffect(() => {
    if (availableLlmModels && ragConfig.generationLlmProvider) {
      const models =
        availableLlmModels.available[ragConfig.generationLlmProvider] || [];
      setGenerationModelOptions(models);
      if (models.length > 0 && !models.includes(ragConfig.generationModel)) {
        setRagConfig((prev) => ({ ...prev, generationModel: models[0] }));
      } else if (models.length === 0) {
        setRagConfig((prev) => ({ ...prev, generationModel: "" }));
      }
    }
  }, [
    ragConfig.generationLlmProvider,
    availableLlmModels,
    ragConfig.generationModel,
    setRagConfig,
  ]);

  // Connect handler
  const handleConnect = async () => {
    if (
      !dbConfig.databaseType ||
      !dbConfig.connectionName ||
      !dbConfig.serverName ||
      !dbConfig.databaseName ||
      !dbConfig.portNumber ||
      !dbConfig.userName ||
      !dbConfig.databasePassword
    ) {
      setMessage(
        "Please fill in all required database connection fields, including password."
      );
      setShowMessage(true);
      return;
    }
    const parsedPort = Number(dbConfig.portNumber);
    if (isNaN(parsedPort)) {
      setMessage("Port Number must be a valid number.");
      setShowMessage(true);
      return;
    }

    try {
      setMessage("Attempting to connect and save database connection...");
      setShowMessage(true);

      const payload = {
        connection_name: dbConfig.connectionName.trim(),
        database_type: dbConfig.databaseType.trim(),
        server_name: dbConfig.serverName.trim(),
        database_name: dbConfig.databaseName.trim(),
        port: parsedPort,
        username: dbConfig.userName.trim(),
        password: dbConfig.databasePassword,
        description: dbConfig.description.trim(),
        save_connection: Boolean(dbConfig.saveConnection),
        connect_immediately: Boolean(dbConfig.connectImmediately),
      };

      const response = await axios.post(
        "https://config-api-service-641805125303.us-central1.run.app/db/connections/save",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setMessage(`Connection saved successfully: ${response.data.message}`);
      } else {
        setMessage(
          `Failed to save connection: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      let errorMessage = `Error saving database connection: ${
        err.message || "Please check console for details."
      }`;
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = `Failed to save connection: ${err.response.data.message}`;
        } else if (err.response.status === 400) {
          errorMessage = `Error saving database connection: Invalid request (Status 400). Please check your input fields.`;
        } else if (err.response.status === 500) {
          errorMessage = `Error saving database connection: Server error (Status 500). Please try again or contact support.`;
        } else {
          errorMessage = `Error saving database connection: ${
            err.response.status
          } - ${err.response.statusText || "Unknown error"}`;
        }
      }
      setMessage(errorMessage);
    } finally {
      setShowMessage(true);
    }
  };

  // Save RAG Credentials handler
  const handleSaveRagCredentials = async () => {
    const payload = {
      generation_provider: ragConfig.generationLlmProvider.toLowerCase(),
      generation_model: ragConfig.generationModel,
      generation_api_key: ragConfig.generationApiKey,
      generation_api_base: null,
      generation_api_version: null,
      embedding_provider: ragConfig.embeddingProvider,
      embedding_model: ragConfig.embeddingModel,
      embedding_api_key: ragConfig.embeddingApiKey,
      storage_account: ragConfig.storageAccount,
      container_name: ragConfig.containerName,
      connection_string: ragConfig.connectionString,
      blob_prefix: null,
      vector_db_type: ragConfig.vectorDBType.toLowerCase().replace(/ /g, ""),
      vector_db_endpoint: ragConfig.vectorDBConnectionStringEndpoint,
      vector_db_api_key: ragConfig.vectorDBAPIKey,
      vector_db_database_name: ragConfig.cosmosDBDatabaseName,
      vector_db_container_name: ragConfig.cosmosDBContainerName,
      chunk_size: 1000,
      chunk_overlap: 200,
      top_k_retrieval: 5,
      enabled: true,
    };

    try {
      setMessage("Saving RAG Credentials...");
      setShowMessage(true);

      const response = await axios.post(
        "https://rag-credentials-api-304429350798.us-central1.run.app/rag/credentials/save",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setMessage(
          `RAG Credentials saved successfully: ${response.data.message}`
        );
      } else {
        setMessage(
          `Failed to save RAG Credentials: ${
            response.data.message || response.data.error || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      let errorMessage = `Error saving RAG Credentials: ${
        err.message || "Please check console for details."
      }`;
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = `Failed to save RAG Credentials: ${err.response.data.message}`;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = `Failed to save RAG Credentials: ${err.response.data.error}`;
        } else {
          errorMessage = `Failed to save RAG Credentials: ${
            err.response.status
          } - ${err.response.statusText || "Unknown error"}`;
        }
      }
      setMessage(errorMessage);
    } finally {
      setShowMessage(true);
    }
  };

  // NEW: Handler for the "Enable LLM" button
  const handleEnableLlm = async () => {
    // Check if all fields are filled
    if (
      !llmConfig.llmProvider ||
      !llmConfig.llmModelName ||
      !llmConfig.prompt ||
      !llmConfig.maxTokens ||
      !llmConfig.temperature
    ) {
      setMessage("Please fill in all LLM configuration fields.");
      setShowMessage(true);
      return;
    }

    // Convert string values to numbers for the payload
    const parsedMaxTokens = parseInt(llmConfig.maxTokens);
    const parsedTemperature = parseFloat(llmConfig.temperature);

    if (isNaN(parsedMaxTokens) || isNaN(parsedTemperature)) {
      setMessage("Max Tokens and Temperature must be valid numbers.");
      setShowMessage(true);
      return;
    }

    try {
      setMessage("Attempting to enable LLM...");
      setShowMessage(true);

      const payload = {
        model_type: llmConfig.llmProvider.toLowerCase(),
        model_name: llmConfig.llmModelName,
        prompt: llmConfig.prompt,
        max_tokens: parsedMaxTokens,
        temperature: parsedTemperature,
      };

      const response = await axios.post(
        "https://fastapi-rag-app-641805125303.us-central1.run.app/llm/generate",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setMessage(
          `LLM enabled successfully. Response: ${JSON.stringify(
            response.data.response
          )}`
        );
      } else {
        setMessage(
          `Failed to enable LLM: ${
            response.data.message || response.data.error || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      let errorMessage = `Error enabling LLM: ${
        err.message || "Please check console for details."
      }`;
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = `Failed to enable LLM: ${err.response.data.message}`;
        } else {
          errorMessage = `Failed to enable LLM: ${err.response.status} - ${
            err.response.statusText || "Unknown error"
          }`;
        }
      }
      setMessage(errorMessage);
    } finally {
      setShowMessage(true);
    }
  };

  return (
    <div className="flex-grow w-full bg-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-[calc(100vh-200px)] relative">
      <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700">
        <div className="flex w-full gap-4 px-8 pt-6 pb-4">
          <Button
            onClick={() => setSelectedSection("usecase")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg transition-all duration-300 ease-in-out
              ${
                selectedSection === "usecase"
                  ? "bg-blue-600 text-white shadow-xl"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
            tabIndex={0}
          >
            <ClipboardList size={20} /> Use Case
          </Button>
          <Button
            onClick={() => setSelectedSection("database")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg transition-all duration-300 ease-in-out
              ${
                selectedSection === "database"
                  ? "bg-blue-600 text-white shadow-xl"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
            tabIndex={0}
          >
            <Database size={20} /> DataSource
          </Button>
          <Button
            onClick={() => setSelectedSection("llm")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg transition-all duration-300 ease-in-out
              ${
                selectedSection === "llm"
                  ? "bg-blue-600 text-white shadow-xl"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
            tabIndex={0}
          >
            <Settings size={20} /> LLM Config
          </Button>
          <Button
            onClick={() => setSelectedSection("rag")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg transition-all duration-300 ease-in-out
              ${
                selectedSection === "rag"
                  ? "bg-blue-600 text-white shadow-xl"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
            tabIndex={0}
          >
            <Share2 size={20} /> RAG Config
          </Button>
        </div>
      </div>

      {/* Section content, scrollable below sticky tabs */}
      <div className="p-8">
        {selectedSection === "usecase" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Use Case</h3>
            <div className="mb-4">
              <label
                htmlFor="useCaseSelect"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Select Use Case
              </label>
              <div className="relative">
                <select
                  id="useCaseSelect"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                  value={selectedUseCase}
                  onChange={(e) => setSelectedUseCase(e.target.value)}
                >
                  {useCaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddNewUseCase}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md mb-6 transition-colors duration-200"
            >
              Add New Use Case
            </Button>

            {selectedUseCase === "Dormant Analyzer" && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-inner">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Dormant Checks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {dormantChecks.map((check) => (
                    <div key={check.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={check.id}
                        name={check.id}
                        checked={check.default_selected}
                        onChange={
                          check.id === "select_all_dormant"
                            ? handleSelectAllChecks
                            : handleSingleCheck
                        }
                        className="form-checkbox h-5 w-5 text-blue-600 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={check.disabled}
                      />
                      <label
                        htmlFor={check.id}
                        className="ml-3 text-gray-700 font-medium cursor-pointer text-sm"
                      >
                        {check.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUseCase === "Compliance Audit" && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-inner">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Compliance Checks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={check.id}
                        name={check.id}
                        checked={check.default_selected}
                        onChange={
                          check.id === "select_all_compliance"
                            ? handleSelectAllChecks
                            : handleSingleCheck
                        }
                        className="form-checkbox h-5 w-5 text-blue-600 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={check.disabled}
                      />
                      <label
                        htmlFor={check.id}
                        className="ml-3 text-gray-700 font-medium cursor-pointer text-sm"
                      >
                        {check.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveUseCase}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {selectedSection === "database" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Connect with Database
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label
                  htmlFor="databaseType"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Database Type
                </label>
                {loading ? (
                  <p className="text-gray-500">Loading database types...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="relative">
                    <select
                      id="databaseType"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                      value={dbConfig.databaseType}
                      onChange={(e) =>
                        setDbConfig((prev) => ({
                          ...prev,
                          databaseType: e.target.value,
                        }))
                      }
                    >
                      {databaseOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="connectionName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Connection Name
                </label>
                <input
                  type="text"
                  id="connectionName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.connectionName}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      connectionName: e.target.value,
                    }))
                  }
                  placeholder="e.g., MyDatabaseConnection"
                />
              </div>
              <div>
                <label
                  htmlFor="serverName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Server Name
                </label>
                <input
                  type="text"
                  id="serverName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.serverName}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      serverName: e.target.value,
                    }))
                  }
                  placeholder="e.g., localhost or 192.168.1.1"
                />
              </div>
              <div>
                <label
                  htmlFor="databaseName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Database Name
                </label>
                <input
                  type="text"
                  id="databaseName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.databaseName}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      databaseName: e.target.value,
                    }))
                  }
                  placeholder="e.g., my_database"
                />
              </div>
              <div>
                <label
                  htmlFor="portNumber"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Port Number
                </label>
                <input
                  type="text"
                  id="portNumber"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.portNumber}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      portNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., 5432"
                />
              </div>
              <div>
                <label
                  htmlFor="userName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  User name
                </label>
                <input
                  type="text"
                  id="userName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.userName}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      userName: e.target.value,
                    }))
                  }
                  placeholder="e.g., sql_user"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="databasePassword"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Database Password
                </label>
                <input
                  type="password"
                  id="databasePassword"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dbConfig.databasePassword}
                  onChange={(e) =>
                    setDbConfig((prev) => ({
                      ...prev,
                      databasePassword: e.target.value,
                    }))
                  }
                  placeholder="********"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleConnect}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Connect
              </Button>
            </div>
          </div>
        )}

        {selectedSection === "llm" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              LLM Configuration
            </h3>
            {llmLoading ? (
              <p className="text-gray-500">Loading LLM configurations...</p>
            ) : llmError ? (
              <p className="text-red-500">{llmError}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label
                    htmlFor="llmProvider"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Provider
                  </label>
                  <div className="relative">
                    <select
                      id="llmProvider"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                      value={llmConfig.llmProvider}
                      onChange={(e) =>
                        setLlmConfig((prev) => ({
                          ...prev,
                          llmProvider: e.target.value,
                        }))
                      }
                    >
                      {availableLlmModels &&
                        Object.keys(availableLlmModels.available).map(
                          (option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          )
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="llmModelName"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Model Name
                  </label>
                  <div className="relative">
                    <select
                      id="llmModelName"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                      value={llmConfig.llmModelName}
                      onChange={(e) =>
                        setLlmConfig((prev) => ({
                          ...prev,
                          llmModelName: e.target.value,
                        }))
                      }
                    >
                      {llmModelNameOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Prompt
                  </label>
                  <input
                    type="text"
                    id="prompt"
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={llmConfig.prompt}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({
                        ...prev,
                        prompt: e.target.value,
                      }))
                    }
                    placeholder="e.g., what is compliance"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxTokens"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    id="maxTokens"
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={llmConfig.maxTokens}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({
                        ...prev,
                        maxTokens: e.target.value,
                      }))
                    }
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="temperature"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="temperature"
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={llmConfig.temperature}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({
                        ...prev,
                        temperature: e.target.value,
                      }))
                    }
                    placeholder="e.g., 0.2"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-start gap-4 mt-4">
              <Button
                onClick={handleEnableLlm}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Enable LLM
              </Button>
            </div>
          </div>
        )}

        {selectedSection === "rag" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              RAG Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label
                  htmlFor="generationLlmProvider"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Generation LLM Provider
                </label>
                {llmLoading ? (
                  <p className="text-gray-500">Loading providers...</p>
                ) : llmError ? (
                  <p className="text-red-500">{llmError}</p>
                ) : (
                  <div className="relative">
                    <select
                      id="generationLlmProvider"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                      value={ragConfig.generationLlmProvider}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          generationLlmProvider: e.target.value,
                        }))
                      }
                    >
                      {availableLlmModels &&
                        Object.keys(availableLlmModels.available).map(
                          (option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          )
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="generationModel"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Generation Model
                </label>
                {llmLoading ? (
                  <p className="text-gray-500">Loading models...</p>
                ) : llmError ? (
                  <p className="text-red-500">{llmError}</p>
                ) : (
                  <div className="relative">
                    <select
                      id="generationModel"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                      value={ragConfig.generationModel}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          generationModel: e.target.value,
                        }))
                      }
                    >
                      {generationModelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="generationApiKey"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Generation API Key
                </label>
                <input
                  type="password"
                  id="generationApiKey"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.generationApiKey}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      generationApiKey: e.target.value,
                    }))
                  }
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label
                  htmlFor="embeddingProvider"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Embedding Provider
                </label>
                <div className="relative">
                  <select
                    id="embeddingProvider"
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                    value={ragConfig.embeddingProvider}
                    onChange={(e) =>
                      setRagConfig((prev) => ({
                        ...prev,
                        embeddingProvider: e.target.value,
                      }))
                    }
                  >
                    {embeddingProviderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="embeddingModel"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Embedding Model
                </label>
                <input
                  type="text"
                  id="embeddingModel"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.embeddingModel}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      embeddingModel: e.target.value,
                    }))
                  }
                  placeholder="e.g., BAAI/bge-large-en-v1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="embeddingApiKey"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Embedding API Key
                </label>
                <input
                  type="password"
                  id="embeddingApiKey"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.embeddingApiKey}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      embeddingApiKey: e.target.value,
                    }))
                  }
                  placeholder="API Key (if needed)"
                />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-6">
              Azure Blob Storage
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label
                  htmlFor="storageAccount"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Storage Account
                </label>
                <input
                  type="text"
                  id="storageAccount"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.storageAccount}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      storageAccount: e.target.value,
                    }))
                  }
                  placeholder="e.g., mystorageaccount"
                />
              </div>
              <div>
                <label
                  htmlFor="containerName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Container Name
                </label>
                <input
                  type="text"
                  id="containerName"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.containerName}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      containerName: e.target.value,
                    }))
                  }
                  placeholder="e.g., mycontainer"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="connectionString"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Connection String
                </label>
                <input
                  type="text"
                  id="connectionString"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={ragConfig.connectionString}
                  onChange={(e) =>
                    setRagConfig((prev) => ({
                      ...prev,
                      connectionString: e.target.value,
                    }))
                  }
                  placeholder="DefaultEndpointsProtocol=https;AccountName=...;"
                />
              </div>
            </div>

            <h4 className="text-2xl font-bold text-gray-800 mb-6">
              Vector Database
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label
                  htmlFor="vectorDBType"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Vector DB Type
                </label>
                <div className="relative">
                  <select
                    id="vectorDBType"
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-white"
                    value={ragConfig.vectorDBType}
                    onChange={(e) =>
                      setRagConfig((prev) => ({
                        ...prev,
                        vectorDBType: e.target.value,
                      }))
                    }
                  >
                    {vectorDBTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
              {ragConfig.vectorDBType === "Azure Cosmos DB" ? (
                <>
                  <div>
                    <label
                      htmlFor="cosmosDBDatabaseName"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Cosmos DB Database Name
                    </label>
                    <input
                      type="text"
                      id="cosmosDBDatabaseName"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ragConfig.cosmosDBDatabaseName}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          cosmosDBDatabaseName: e.target.value,
                        }))
                      }
                      placeholder="e.g., vector-database"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cosmosDBContainerName"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Cosmos DB Container Name
                    </label>
                    <input
                      type="text"
                      id="cosmosDBContainerName"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ragConfig.cosmosDBContainerName}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          cosmosDBContainerName: e.target.value,
                        }))
                      }
                      placeholder="e.g., vector-container"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="vectorDBConnectionStringEndpoint"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Vector DB Endpoint
                    </label>
                    <input
                      type="text"
                      id="vectorDBConnectionStringEndpoint"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ragConfig.vectorDBConnectionStringEndpoint}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          vectorDBConnectionStringEndpoint: e.target.value,
                        }))
                      }
                      placeholder="e.g., https://your-vector-db.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="vectorDBAPIKey"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Vector DB API Key
                    </label>
                    <input
                      type="password"
                      id="vectorDBAPIKey"
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ragConfig.vectorDBAPIKey}
                      onChange={(e) =>
                        setRagConfig((prev) => ({
                          ...prev,
                          vectorDBAPIKey: e.target.value,
                        }))
                      }
                      placeholder="********"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleSaveRagCredentials}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Save RAG Credentials
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
