// Model Use-Case Configuration for PERSONAL AI TRAINING OS
// Maps specific use cases to optimal models based on requirements and cost

/**
 * MODEL USE CASE CONFIGURATION
 * 
 * This configuration maps different use cases to their optimal models:
 * 1. Best all-round & cost-optimized: GPT-5.2
 * 2. Very cheap but powerful: DeepSeek V3.2
 * 3. Balanced: Anthropic Claude Sonnet 4
 * 4. Super long documents: Gemini 3 Flash
 */

// Model definitions with characteristics
const MODELS = {
    "GPT-5.2": {
        id: "openai/gpt-5.2",
        strengths: ["all-round capabilities", "cost-optimized", "reasoning", "creativity", "instruction-following"],
        costTier: "medium",
        contextWindow: "large",
        bestFor: ["complex reasoning", "creative tasks", "most general use cases"]
    },
    "DeepSeek V3.2": {
        id: "deepseek/deepseek-v3.2",
        strengths: ["efficiency", "code generation", "low cost", "data processing"],
        costTier: "low",
        contextWindow: "medium",
        bestFor: ["cost-sensitive operations", "data tasks", "code generation", "high-volume requests"]
    },
    "Claude Sonnet 4": {
        id: "anthropic/claude-3-sonnet-4",
        strengths: ["balanced performance", "safety", "instruction-following", "factuality"],
        costTier: "medium",
        contextWindow: "large",
        bestFor: ["balanced tasks", "nuanced reasoning", "safety-critical applications"]
    },
    "Gemini 3 Flash": {
        id: "google/gemini-3-flash",
        strengths: ["document processing", "extremely long context", "multi-modal"],
        costTier: "medium-high",
        contextWindow: "very large",
        bestFor: ["super long documents", "document analysis", "multi-document reasoning"]
    }
};

// Use case to model mapping
const USE_CASES = {
    // Training planning cases
    "dailyTrainingPlan": "GPT-5.2",
    "weeklyPeriodization": "GPT-5.2",
    "recoveryBasedAdjustment": "GPT-5.2",
    "trainingProgramDesign": "GPT-5.2",
    
    // Data processing cases
    "workoutDataProcessing": "DeepSeek V3.2",
    "metricsCalculation": "DeepSeek V3.2",
    "dataFormatting": "DeepSeek V3.2",
    "quickDataQueries": "DeepSeek V3.2",
    
    // Balanced needs
    "exerciseTechniqueFeedback": "Claude Sonnet 4",
    "nutritionAdvice": "Claude Sonnet 4",
    "generalHealthQuestions": "Claude Sonnet 4",
    "formCritique": "Claude Sonnet 4",
    
    // Document processing
    "researchPaperAnalysis": "Gemini 3 Flash",
    "trainingHistoryAnalysis": "Gemini 3 Flash",
    "longTermTrendAnalysis": "Gemini 3 Flash",
    "comprehensiveReports": "Gemini 3 Flash"
};

// Cost optimization settings
const COST_PRIORITY = {
    high: "DeepSeek V3.2", // Always use cheapest model when cost is highest priority
    medium: "GPT-5.2",     // Default to all-round model for balanced approach
    low: "GPT-5.2"         // Use best performance when cost is low priority
};

// Export model configuration
window.modelUseCaseConfig = {
    models: MODELS,
    useCases: USE_CASES,
    costPriority: COST_PRIORITY,
    
    // Get model for specific use case
    getModelForUseCase: function(useCase, costPriority = "medium") {
        // If we have a specific model for this use case, use it
        if (this.useCases[useCase]) {
            return this.models[this.useCases[useCase]];
        }
        
        // Otherwise, use cost priority to determine model
        return this.models[this.costPriority[costPriority]];
    },
    
    // Get best model for specific characteristics
    getModelByCharacteristics: function(requirements) {
        // Simple implementation - returns model that best matches the given requirements
        // In a real implementation, this would use a more sophisticated matching algorithm
        
        // For now, just return GPT-5.2 as default
        return this.models["GPT-5.2"];
    }
};