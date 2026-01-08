/**
 * Reflection Prompts
 * Optional thinking starters - never mandatory
 * 
 * Rules:
 * - Prompts must be editable
 * - Prompts must be deletable
 * - Prompts must never rotate automatically
 * - No recommendation logic
 */

const DEFAULT_PROMPTS = [
  {
    promptId: "prompt_1",
    text: "What did I notice this week?",
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    promptId: "prompt_2",
    text: "What feels unclear right now?",
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    promptId: "prompt_3",
    text: "What pattern am I seeing?",
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    promptId: "prompt_4",
    text: "What am I avoiding?",
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    promptId: "prompt_5",
    text: "What assumption am I making?",
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

const PROMPTS_STORAGE_KEY = "lifelab_reflection_prompts";

/**
 * Get all prompts
 * @returns {Array} Array of prompt objects
 */
export function getPrompts() {
  const stored = localStorage.getItem(PROMPTS_STORAGE_KEY);
  
  if (!stored) {
    // Initialize with defaults
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROMPTS));
    return DEFAULT_PROMPTS;
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse prompts:", error);
    return DEFAULT_PROMPTS;
  }
}

/**
 * Add a custom prompt
 * @param {string} text - Prompt text
 * @returns {Object} New prompt object
 */
export function addPrompt(text) {
  const prompts = getPrompts();
  
  const newPrompt = {
    promptId: `prompt_${Date.now()}`,
    text,
    isDefault: false,
    createdAt: new Date().toISOString()
  };
  
  prompts.push(newPrompt);
  localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
  
  return newPrompt;
}

/**
 * Update a prompt
 * @param {string} promptId - Prompt ID
 * @param {string} text - New prompt text
 * @returns {boolean} Success status
 */
export function updatePrompt(promptId, text) {
  const prompts = getPrompts();
  const index = prompts.findIndex(p => p.promptId === promptId);
  
  if (index < 0) return false;
  
  prompts[index].text = text;
  localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
  
  return true;
}

/**
 * Delete a prompt
 * @param {string} promptId - Prompt ID
 * @returns {boolean} Success status
 */
export function deletePrompt(promptId) {
  const prompts = getPrompts();
  const filtered = prompts.filter(p => p.promptId !== promptId);
  
  localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
