import { useEffect } from 'react';
import * as THREE from 'three';

type MaterialType = 'metal' | 'fabric' | 'wood' | 'plastic' | 'ceramic' | 'default';

interface MaterialProps {
  type?: MaterialType;
  envMap?: THREE.Texture;
  emissiveIntensity?: number;
}

/**
 * Hook to apply PBR material properties to a 3D object and its children
 */
export function useMaterialEnhancer(
  object: THREE.Object3D | undefined | null,
  props?: MaterialProps
) {
  useEffect(() => {
    if (!object) return;

    const materialProps: Record<MaterialType, any> = {
      metal: {
        metalness: 0.85,
        roughness: 0.15,
        color: new THREE.Color('#d4d4d4'),
      },
      fabric: {
        metalness: 0.0,
        roughness: 0.92,
        color: new THREE.Color('#3a3a3a'),
      },
      wood: {
        metalness: 0.1,
        roughness: 0.65,
        color: new THREE.Color('#8b6f47'),
      },
      plastic: {
        metalness: 0.2,
        roughness: 0.75,
        color: new THREE.Color('#2d2d2d'),
      },
      ceramic: {
        metalness: 0.05,
        roughness: 0.35,
        color: new THREE.Color('#f5f5f5'),
      },
      default: {
        metalness: 0.5,
        roughness: 0.5,
      },
    };

    const type = props?.type || 'default';
    const mat = materialProps[type];

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Handle array of materials
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            if (
              (material as THREE.MeshStandardMaterial).isMeshStandardMaterial ||
              (material as THREE.Material).type === 'MeshPhysicalMaterial'
            ) {
              const stdMat = material as THREE.MeshStandardMaterial;
              stdMat.metalness = mat.metalness;
              stdMat.roughness = mat.roughness;
              if (mat.color) stdMat.color = mat.color;
              if (props?.envMap) stdMat.envMap = props.envMap;
              if (props?.emissiveIntensity)
                stdMat.emissiveIntensity = props.emissiveIntensity;
            }
          });
        } else if (mesh.material) {
          const mat_obj = mesh.material as any;
          if (
            (mat_obj as THREE.MeshStandardMaterial).isMeshStandardMaterial ||
            mat_obj.type === 'MeshPhysicalMaterial'
          ) {
            const stdMat = mat_obj as THREE.MeshStandardMaterial;
            stdMat.metalness = mat.metalness;
            stdMat.roughness = mat.roughness;
            if (mat.color) stdMat.color = mat.color;
            if (props?.envMap) stdMat.envMap = props.envMap;
            if (props?.emissiveIntensity)
              stdMat.emissiveIntensity = props.emissiveIntensity;
          }
        }
      }
    });
  }, [object, props]);
}

/**
 * Hook to enhance object with glow/emissive effect
 */
export function useGlowEffect(
  object: THREE.Object3D | undefined | null,
  enabled: boolean = true,
  color: string = '#6366f1',
  intensity: number = 0.5
) {
  useEffect(() => {
    if (!object || !enabled) return;

    const glowColor = new THREE.Color(color);

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if ((mat as any).isMeshStandardMaterial) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              stdMat.emissive = glowColor;
              stdMat.emissiveIntensity = intensity;
            }
          });
        } else if (mesh.material) {
          const mat = mesh.material as any;
          if (mat.isMeshStandardMaterial) {
            const stdMat = mat as THREE.MeshStandardMaterial;
            stdMat.emissive = glowColor;
            stdMat.emissiveIntensity = intensity;
          }
        }
      }
    });

    return () => {
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if ((mat as any).isMeshStandardMaterial) {
                const stdMat = mat as THREE.MeshStandardMaterial;
                stdMat.emissiveIntensity = 0;
              }
            });
          } else if (mesh.material) {
            const mat = mesh.material as any;
            if (mat.isMeshStandardMaterial) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              stdMat.emissiveIntensity = 0;
            }
          }
        }
      });
    };
  }, [object, enabled, color, intensity]);
}


