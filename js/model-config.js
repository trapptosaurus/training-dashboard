// Model Configuration for PERSONAL AI TRAINING OS
// Defines model priorities and routing logic

// Model priorities
const MODEL_PRIORITIES = {
    primary: "GPT-5.2",
    secondary: "DeepSeek V3.2",
    tertiary: "Claude Sonnet 4"
};

// Task-specific model assignments
const TASK_MODELS = {
    trainingPlanning: MODEL_PRIORITIES.primary,
    dataProcessing: MODEL_PRIORITIES.secondary,
    visualization: MODEL_PRIORITIES.primary,
    recoveryAnalysis: MODEL_PRIORITIES.primary,
    recommendationEngine: MODEL_PRIORITIES.primary,
    codeGeneration: MODEL_PRIORITIES.secondary
};

// Model fallback chain
const MODEL_FALLBACKS = {
    [MODEL_PRIORITIES.primary]: MODEL_PRIORITIES.secondary,
    [MODEL_PRIORITIES.secondary]: MODEL_PRIORITIES.tertiary,
    [MODEL_PRIORITIES.tertiary]: MODEL_PRIORITIES.primary
};

// Export model configuration
window.modelConfig = {
    priorities: MODEL_PRIORITIES,
    taskModels: TASK_MODELS,
    fallbacks: MODEL_FALLBACKS,
    
    // Get model for specific task with fallback support
    getModelForTask: function(task, unavailableModels = []) {
        let model = this.taskModels[task] || this.priorities.primary;
        
        // If the preferred model is unavailable, use fallback
        if (unavailableModels.includes(model)) {
            model = this.fallbacks[model];
            
            // If fallback is also unavailable, try the next one
            if (unavailableModels.includes(model)) {
                model = this.fallbacks[model];
            }
        }
        
        return model;
    }
};