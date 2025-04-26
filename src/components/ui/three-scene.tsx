import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface ThreeSceneProps {
  isFlipped: boolean;
  onFlip: () => void;
}

export default function ThreeScene({ isFlipped, onFlip }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);
    
    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xA78BFA, // Lighter purple color
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Create a second set of particles with different color
    const particlesGeometry2 = new THREE.BufferGeometry();
    const particlesCount2 = 200;
    const posArray2 = new Float32Array(particlesCount2 * 3);
    
    for (let i = 0; i < particlesCount2 * 3; i++) {
      posArray2[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
    
    const particlesMaterial2 = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xF472B6, // Pink color
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    
    const particlesMesh2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
    scene.add(particlesMesh2);
    
    // Create floating shapes with dark theme colors
    type ShapeMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
    const shapes: ShapeMesh[] = [];
    
    const createShape = (geometry: THREE.BufferGeometry, color: number, x: number, y: number, z: number) => {
      const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        shininess: 80,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      shapes.push(mesh);
    };
    
    // Add various shapes with dark theme colors
    createShape(new THREE.TorusGeometry(1, 0.3, 16, 100), 0x8B5CF6, -2, 2, -5); // Purple color
    createShape(new THREE.OctahedronGeometry(0.8), 0xEC4899, 2, -1, -3); // Pink color
    createShape(new THREE.IcosahedronGeometry(0.5), 0x6366F1, -1, -2, -2); // Indigo color
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.003 + i * 0.001;
        shape.rotation.y += 0.004 + i * 0.001;
        
        // Add floating animation
        shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      ref={containerRef}
    />
  );
}
