/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simulates a Verifiable Delay Function (VDF).
 * In a real VDF, this would be a series of sequential operations (like modular squaring)
 * that cannot be parallelized.
 */
export async function solveVDF(
  inputKey: string,
  difficulty: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  const totalSteps = difficulty * 20; // Scale steps by difficulty
  const delayPerStep = 50; // ms
  
  for (let i = 0; i <= totalSteps; i++) {
    // Simulate some work
    Math.sqrt(Math.random() * 1000000);
    
    if (onProgress) {
      onProgress((i / totalSteps) * 100);
    }
    
    // Artificial delay to simulate sequential computation
    await new Promise((resolve) => setTimeout(resolve, delayPerStep));
  }
  
  return inputKey; // In simulation, the key is the same, but "unlocked"
}

export function estimateUnlockTime(difficulty: number): string {
  const seconds = (difficulty * 20 * 50) / 1000;
  return `${seconds.toFixed(1)}s`;
}
