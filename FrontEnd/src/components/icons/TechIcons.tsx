import type { ImgHTMLAttributes } from "react";

export interface TechIconProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  size?: number | string;
  className?: string;
  alt?: string;
}

function createTechIcon(src: string, defaultAlt: string) {
  const Component = ({
    size = 20,
    className = "",
    alt = defaultAlt,
    style,
    ...props
  }: TechIconProps) => {
    const dim = typeof size === "number" ? `${size}px` : size;
    return (
      <img
        src={src}
        alt={alt}
        width={typeof size === "number" ? size : undefined}
        height={typeof size === "number" ? size : undefined}
        className={`tech-icon-img ${className}`.trim()}
        style={{
          width: dim,
          height: dim,
          objectFit: "contain",
          display: "inline-block",
          verticalAlign: "middle",
          flexShrink: 0,
          ...style,
        }}
        loading="lazy"
        decoding="async"
        {...props}
      />
    );
  };
  Component.displayName = `TechIcon(${defaultAlt})`;
  return Component;
}

/* 
   OFFICIAL TECH STACK ICONS
   Verified original vectors from Devicon & Simple Icons
    */

/** Official Python Foundation Logo (Interlocking Blue & Yellow Snakes) */
export const TechPython = createTechIcon("/tech-icons/python.svg", "Python");

/** Official TypeScript Logo (Microsoft Blue Square with TS) */
export const TechTypeScript = createTechIcon(
  "/tech-icons/typescript.svg",
  "TypeScript",
);

/** Official C++ Logo (Standard C++ Hexagonal Emblem) */
export const TechCpp = createTechIcon("/tech-icons/cplusplus.svg", "C++");

/** Official Visual Studio Code Logo (Microsoft VS Code Vector) */
export const TechVSCode = createTechIcon("/tech-icons/vscode.svg", "VS Code");

/** Official PostgreSQL Logo (Slonik Elephant Emblem) */
export const TechPostgres = createTechIcon(
  "/tech-icons/postgresql.svg",
  "PostgreSQL",
);

/** Official React Logo (Cyan Atom Orbitals) */
export const TechReact = createTechIcon("/tech-icons/react.svg", "React");

/** Official Docker Logo (Blue Container Whale) */
export const TechDocker = createTechIcon("/tech-icons/docker.svg", "Docker");

/** Official GNU Bash / Linux Terminal Logo */
export const TechTerminal = createTechIcon(
  "/tech-icons/bash.svg",
  "Bash Shell",
);

/** Official Arduino / Embedded Hardware Logo */
export const TechHardware = createTechIcon(
  "/tech-icons/arduino.svg",
  "Hardware / Arduino",
);

/** Official Google Flutter / Mobile Cross-Platform Logo */
export const TechMobile = createTechIcon(
  "/tech-icons/flutter.svg",
  "Flutter / Mobile",
);

/** Official PyTorch / Deep Learning AI Logo */
export const TechAI = createTechIcon("/tech-icons/pytorch.svg", "PyTorch AI");

/** Official Cybersecurity / Kali Linux Shield Logo */
export const TechCyber = createTechIcon(
  "/tech-icons/kali.svg",
  "Cybersecurity",
);

/** Official Wireshark Network Packet Analyzer Logo */
export const TechWireshark = createTechIcon(
  "/tech-icons/wireshark.svg",
  "Wireshark",
);

/** Official Solidity / Web3 Blockchain Logo */
export const TechBlockchain = createTechIcon(
  "/tech-icons/solidity.svg",
  "Solidity Blockchain",
);

/** Official NetworkX / Distributed Networking Topology Logo */
export const TechNetworking = createTechIcon(
  "/tech-icons/network.svg",
  "Computer Networks",
);

/** Official Unity Game Engine Logo */
export const TechGameDev = createTechIcon(
  "/tech-icons/unity.svg",
  "Game Engine",
);

/** Official Godot Game Engine Logo */
export const TechGodot = createTechIcon(
  "/tech-icons/godot.svg",
  "Godot Engine",
);

/** Official Java Duke / Cup Logo */
export const TechJava = createTechIcon("/tech-icons/java.svg", "Java");

/** Official JavaScript Logo */
export const TechJavaScript = createTechIcon(
  "/tech-icons/javascript.svg",
  "JavaScript",
);

/** Official Kubernetes Cloud Orchestration Logo */
export const TechKubernetes = createTechIcon(
  "/tech-icons/kubernetes.svg",
  "Kubernetes",
);

/** Official Linux Tux Penguin Logo */
export const TechLinux = createTechIcon("/tech-icons/linux.svg", "Linux");
