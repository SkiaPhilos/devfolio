import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

const loader = new GLTFLoader();

interface LoadOptions {
  onProgress?: (loaded: number, total: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Cache for loaded GLB models to avoid duplicate loads
 */
const modelCache = new Map<string, THREE.Group>();
const modelBasePath = `${import.meta.env.BASE_URL}models/`;

/**
 * Load a GLB model from the public/models directory
 * @param modelName - Name of the model file (e.g., 'desk.glb')
 * @param options - Configuration options
 * @returns Promise that resolves to the model group
 */
export async function loadGLBModel(
  modelName: string,
  options?: LoadOptions
): Promise<THREE.Group> {
  // Return cached model if available
  if (modelCache.has(modelName)) {
    return modelCache.get(modelName)!.clone();
  }

  return new Promise((resolve, reject) => {
    const modelPath = `${modelBasePath}${modelName}`;

    loader.load(
      modelPath,
      (gltf: GLTF) => {
        const model = gltf.scene;
        modelCache.set(modelName, model);
        resolve(model.clone() as THREE.Group);
      },
      (progress: ProgressEvent<EventTarget>) => {
        options?.onProgress?.(progress.loaded, progress.total);
      },
      (error: unknown) => {
        const message = error instanceof Error ? error.message : `Unknown loader error for ${modelName}`;
        const errorMsg = new Error(
          `Failed to load model ${modelName}: ${message}`
        );
        options?.onError?.(errorMsg);
        reject(errorMsg);
      }
    );
  });
}

/**
 * Load multiple GLB models in parallel with progress tracking
 * @param modelNames - Array of model file names
 * @param options - Configuration options
 * @returns Promise that resolves to map of model names to loaded models
 */
export async function loadMultipleGLBModels(
  modelNames: string[],
  options?: LoadOptions
): Promise<Map<string, THREE.Group>> {
  const models = new Map<string, THREE.Group>();
  const promises = modelNames.map((name) =>
    loadGLBModel(name, options)
      .then((model) => {
        models.set(name, model);
        return { name, model };
      })
      .catch((error) => {
        console.error(`Failed to load ${name}:`, error);
        return { name, model: null };
      })
  );

  await Promise.all(promises);
  return models;
}

/**
 * Apply PBR material to a model based on its type
 * @param model - The Three.js model/mesh
 * @param materialType - Type of material (metal, fabric, wood, plastic)
 */
export function applyPBRMaterial(
  model: THREE.Object3D,
  materialType: 'metal' | 'fabric' | 'wood' | 'plastic' | 'ceramic' = 'metal'
) {
  const materialProps = {
    metal: {
      metalness: 0.9,
      roughness: 0.1,
      color: new THREE.Color('#c0c0c0'),
    },
    fabric: {
      metalness: 0.0,
      roughness: 0.95,
      color: new THREE.Color('#3d3d3d'),
    },
    wood: {
      metalness: 0.1,
      roughness: 0.6,
      color: new THREE.Color('#8b6f47'),
    },
    plastic: {
      metalness: 0.2,
      roughness: 0.7,
      color: new THREE.Color('#2a2a2a'),
    },
    ceramic: {
      metalness: 0.0,
      roughness: 0.3,
      color: new THREE.Color('#f5f5f5'),
    },
  };

  const props = materialProps[materialType];

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            (mat as THREE.MeshStandardMaterial).metalness = props.metalness;
            (mat as THREE.MeshStandardMaterial).roughness = props.roughness;
          }
        });
      } else if ((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        (mesh.material as THREE.MeshStandardMaterial).metalness = props.metalness;
        (mesh.material as THREE.MeshStandardMaterial).roughness = props.roughness;
      }
    }
  });
}

/**
 * Clear the model cache
 */
export function clearModelCache() {
  modelCache.clear();
}
