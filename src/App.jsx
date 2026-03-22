import { useState } from "react";

const PHASES = [
  {
    id: "phase1",
    title: "PHASE 1: Linux — Become Dangerous on the Terminal",
    duration: "Weeks 1–6",
    color: "#F97316",
    icon: "🐧",
    totalHours: "~60 hours (1.5 hrs/day × 6 weeks)",
    whyFirst: "Everything you will ever touch — Docker, Kubernetes, Terraform, cloud VMs, GPU servers, CI/CD — runs on Linux. If you skip this, every advanced tool becomes a black box you can't debug. This is not optional. This is oxygen.",
    weeks: [
      {
        week: "Week 1",
        title: "Files, Directories, Permissions & The Shell",
        concepts: [
          "What is a shell vs terminal vs console (they're different things)",
          "Absolute vs relative paths — why '/' matters, what '~' and '.' and '..' mean",
          "File types in Linux: regular, directory, symlink, block device, socket, pipe — use 'ls -la' and understand every column",
          "Permissions deep: read/write/execute for user/group/others, octal notation (755, 644), chmod, chown",
          "Special permissions: SUID, SGID, sticky bit — what they do and when they're dangerous",
          "Hidden files (dotfiles), .bashrc, .profile — what runs when you open a terminal",
          "stdin, stdout, stderr — file descriptors 0, 1, 2 — this is how ALL Linux I/O works",
          "Redirection: >, >>, 2>, 2>&1, /dev/null — understand each one",
          "Pipes: | — how one command's output becomes another's input",
        ],
        scenarios: [
          "You run a script and get 'Permission denied' even though you're the owner. Debug it. (Hint: execute permission)",
          "A file shows -rwSr--r-- — what does that capital S mean? Is this a security problem?",
          "You want to find all files larger than 100MB modified in the last 7 days. Do it with one command.",
          "Your terminal shows nothing when you run a command but the exit code is 1. Where did the error go?",
        ],
        hardProject: {
          name: "Build Your Own 'ls' Command Using Only Shell Builtins",
          description: "Write a Bash script that replicates 'ls -la' output — showing permissions, owner, size, date, filename. You'll need to read /proc or use stat. The goal is to understand what file metadata actually is at the OS level.",
          skills: "File system internals, /proc filesystem, stat system call, string formatting in Bash",
        },
        resources: [
          "Book: 'The Linux Command Line' by William Shotts (free PDF) — Chapters 1-10",
          "Lab: Set up an Ubuntu VM on your laptop using VirtualBox (free). Do EVERYTHING in the terminal, no GUI.",
          "Practice: https://overthewire.org/wargames/bandit/ — Levels 0-15 (free, gamified Linux challenges)",
        ],
      },
      {
        week: "Week 2",
        title: "Processes, Signals & How Linux Runs Programs",
        concepts: [
          "What IS a process — it's a running instance of a program with its own PID, memory space, file descriptors",
          "Process states: Running (R), Sleeping (S), Stopped (T), Zombie (Z), Dead (D) — what each means",
          "Parent-child relationship: fork() and exec() — this is how EVERY process is created in Linux",
          "PID 1 (init/systemd) — the ancestor of all processes, why it matters in containers",
          "Foreground vs background processes: &, jobs, fg, bg, nohup, disown",
          "Signals: SIGTERM (15), SIGKILL (9), SIGHUP (1), SIGINT (2), SIGSTOP, SIGCONT — what each does",
          "Why 'kill -9' is a last resort — it doesn't allow cleanup (temp files, locks, connections)",
          "Process priority: nice, renice — how Linux decides which process gets CPU time",
          "Zombie processes: what creates them (parent didn't call wait()), how to find and fix them",
          "/proc filesystem: /proc/[PID]/status, /proc/[PID]/fd, /proc/[PID]/cmdline — the kernel's window into processes",
        ],
        scenarios: [
          "A process is using 100% CPU. Find it, check what files it has open, what network connections it's holding, what command started it — all from /proc, not from top/htop.",
          "You have 50 zombie processes. The parent PID is 3421. What do you do? (kill the parent, not the zombies)",
          "You SSH into a server, start a long-running script, and your SSH connection drops. What happens to the script? How do you prevent this?",
          "A process ignores SIGTERM. Why might this happen? What can you do?",
        ],
        hardProject: {
          name: "Build a Process Monitor (Your Own 'top')",
          description: "Write a Bash script that reads /proc for every running process and displays: PID, process name, state, memory usage (RSS), CPU time, parent PID — refreshing every 2 seconds. No 'top', 'htop', or 'ps' allowed — read directly from /proc.",
          skills: "Deep understanding of /proc, process states, memory metrics, parsing, loops",
        },
        resources: [
          "Book: 'The Linux Command Line' — Chapters 10-12 (processes and environment)",
          "Book: 'How Linux Works' by Brian Ward — Chapter 8 (Processes and Threads)",
          "Lab: Run 'stress' or 'stress-ng' to simulate CPU/memory load, then debug using /proc only",
        ],
      },
      {
        week: "Week 3",
        title: "Memory, Storage & Disk I/O",
        concepts: [
          "Virtual memory: why each process thinks it has ALL the memory, page tables, MMU",
          "Physical vs virtual memory, RSS vs VSZ — what 'free -h' output actually means",
          "Page cache: Linux uses free RAM as disk cache — this is why 'used' memory looks high but it's fine",
          "Swap: what it is, when it's used, why SSD swap is faster, swappiness setting",
          "OOM Killer: when Linux kills processes — oom_score, oom_score_adj, how to protect critical processes",
          "Block devices vs character devices — /dev/sda, /dev/nvme0n1",
          "Filesystems: ext4, xfs — what they do (organize data on disk), journaling, inodes",
          "Inodes: every file has one — inode number, metadata stored in inode, 'df -i' to check inode usage",
          "Mount points: how Linux attaches storage to the directory tree, /etc/fstab, mount options",
          "LVM (Logical Volume Manager): physical volumes → volume groups → logical volumes — why it's useful",
          "I/O monitoring: iostat, iotop — understanding await, %util, read/write throughput",
        ],
        scenarios: [
          "'df' shows disk is 40% full but you can't create new files — what's wrong? (inode exhaustion — thousands of tiny files)",
          "A server has 16GB RAM. 'free' shows 14GB used but 'ps' shows only 4GB in processes. Where's the other 10GB? (page cache — it's normal)",
          "The OOM killer killed your database process but not the logging daemon. Why? How do you prevent this?",
          "A container is consuming 2GB memory. You set K8s limit to 1.5GB. What happens? (OOM kill at container level via cgroups)",
          "Write performance is terrible. iostat shows 100% util on the disk. The app writes small files frequently. What's the fix?",
        ],
        hardProject: {
          name: "Build a Memory and Disk Health Dashboard",
          description: "Write a script that reads /proc/meminfo, /proc/diskstats, and /proc/[PID]/status to display: total/free/cached memory, swap usage, per-disk IOPS and throughput, and the top 5 memory-consuming processes. Output as a formatted table that refreshes every 3 seconds. Bonus: alert when memory usage > 80% or disk I/O util > 90%.",
          skills: "/proc/meminfo parsing, /proc/diskstats understanding, memory concepts, I/O metrics",
        },
        resources: [
          "Book: 'How Linux Works' by Brian Ward — Chapter 4 (Disks and Filesystems)",
          "Tool: Install 'stress-ng' — stress memory and disk, observe with your dashboard",
          "Video: 'Linux Memory Management' by Steven Rostedt (YouTube, free) — watch at 1.5x",
        ],
      },
      {
        week: "Week 4",
        title: "Bash Scripting — From Zero to Automation",
        concepts: [
          "Variables: declaring, using, quoting (single vs double quotes vs backticks), variable expansion",
          "Exit codes: every command returns 0 (success) or non-zero (failure) — $? to check",
          "Conditionals: if/elif/else, test/[ ], [[ ]], -f (file exists), -d (directory), -z (empty string), string comparison",
          "Loops: for, while, until — iterating over files, lines in a file, command output",
          "Functions: declaring, calling, local variables, return values vs exit codes",
          "Input handling: read, command line arguments ($1, $2, $@, $#), getopts for flags",
          "String manipulation: ${var#pattern}, ${var%pattern}, ${var/old/new}, ${#var} for length",
          "Arrays: declaring, iterating, associative arrays",
          "Error handling: set -e (exit on error), set -u (error on undefined), set -o pipefail, trap for cleanup",
          "Practical patterns: log file parsing with grep/awk/sed, CSV processing, config file reading",
        ],
        scenarios: [
          "Write a script that takes a directory as argument, finds all .log files older than 30 days, compresses them, and deletes the originals — with proper error handling and a dry-run flag.",
          "A production script fails silently. It runs 5 commands and one in the middle fails but the rest continue. Fix the script to fail fast and clean up properly.",
          "Parse an nginx access log and output: top 10 IPs by request count, top 10 URLs, and count of each HTTP status code.",
        ],
        hardProject: {
          name: "Build a Server Health Check Suite",
          description: "Write a complete Bash toolkit (multiple scripts) that checks: CPU load (from /proc/loadavg), memory usage (from /proc/meminfo), disk usage (df), zombie processes, failed systemd services, network port reachability, and SSL certificate expiry dates. Output a formatted health report. Support --json flag for machine-readable output. Add a --fix flag that attempts to restart failed services. This is a real DevOps tool.",
          skills: "Everything from weeks 1-4 combined: processes, memory, disk, scripting, error handling",
        },
        resources: [
          "Book: 'The Linux Command Line' — Part 4 (Shell Scripting)",
          "Practice: Write every script from scratch. No copying. Type every character.",
          "Challenge: Rewrite one manual task you do at work as a Bash script",
        ],
      },
      {
        week: "Week 5",
        title: "Systemd, Services & Boot Process",
        concepts: [
          "The boot process: BIOS/UEFI → bootloader (GRUB) → kernel → initramfs → systemd (PID 1)",
          "Systemd: it IS PID 1 — manages services, sockets, timers, mounts, targets",
          "Unit files: [Unit], [Service], [Install] sections — ExecStart, Restart, After, Wants, Type",
          "Service types: simple, forking, oneshot, notify, idle — when to use which",
          "Targets: multi-user.target, graphical.target — the systemd equivalent of runlevels",
          "journalctl: querying logs by service, time range, priority, boot — this is how you debug in production",
          "Timer units: systemd replacement for cron — OnCalendar, OnBootSec, Persistent",
          "Socket activation: service starts only when someone connects — saves resources",
          "Cgroups (via systemd): CPU/memory/IO limits on services — MemoryMax, CPUQuota",
        ],
        scenarios: [
          "Write a systemd unit file from scratch for a Python web app. It should: start after network is up, restart on crash (max 3 times per minute), run as non-root user, have memory limit of 512MB, log to journald.",
          "A service keeps crashing and restarting. Use journalctl to find: when it started crashing, what error it logs, how many times it's restarted in the last hour.",
          "You want a script to run every 15 minutes but NOT if the previous run is still in progress. Use systemd timer (not cron).",
        ],
        hardProject: {
          name: "Build a Service Manager (Your Own Mini-Systemd)",
          description: "Write a Bash script that can: start a process as a daemon (background, detached), save its PID to a file, stop it gracefully (SIGTERM → wait 10s → SIGKILL), show status (running/stopped/crashed), restart it, and auto-restart on crash (monitor loop). This is fundamentally what systemd does. You'll understand why PID files exist, why graceful shutdown matters, and why process supervision is hard.",
          skills: "Process management, signals, PID files, daemon pattern, monitoring loops",
        },
        resources: [
          "Book: 'How Linux Works' — Chapter 6 (System Startup)",
          "Man pages: 'man systemd.service', 'man systemd.timer', 'man journalctl'",
          "Lab: Write 3 different unit files for 3 different apps on your VM",
        ],
      },
      {
        week: "Week 6",
        title: "Users, Security & Hardening",
        concepts: [
          "Users and groups: /etc/passwd, /etc/shadow, /etc/group — what each field means",
          "Root vs non-root: why running as root is dangerous, sudo, sudoers file, principle of least privilege",
          "SSH: key-based auth (how RSA/Ed25519 keys work), ssh-keygen, authorized_keys, ssh_config, agent forwarding",
          "Firewall: iptables basics — chains (INPUT, OUTPUT, FORWARD), rules, ACCEPT/DROP/REJECT, stateful tracking",
          "SELinux/AppArmor: mandatory access control — why regular permissions aren't enough, contexts, profiles",
          "File integrity: sha256sum, checksums, tripwire concept",
          "Process capabilities: cap_net_bind_service, cap_sys_admin — fine-grained alternatives to running as root",
          "Common attack vectors: world-writable files, SUID binaries, open ports, weak SSH config",
        ],
        scenarios: [
          "An attacker gained access to a non-root user. What can they see? What can't they access? How do you limit the damage? (Check sudo rights, SUID binaries, readable sensitive files)",
          "A web app needs to bind to port 80 but you don't want it running as root. How? (setcap or reverse proxy)",
          "You take over a server with no documentation. Audit it: list all users with shell access, all open ports, all SUID binaries, all cron jobs, all running services.",
        ],
        hardProject: {
          name: "Build a Linux Security Auditor",
          description: "Write a comprehensive Bash script that audits a Linux system: lists all users with login shells, finds all SUID/SGID binaries, checks for world-writable files in sensitive directories, shows all listening ports and which process owns them, checks SSH config for weak settings (password auth, root login), checks for passwordless sudo users, and outputs a security report with severity levels (CRITICAL, WARNING, INFO). This is a real penetration testing prerequisite tool.",
          skills: "Everything from Phase 1 combined into one capstone project",
        },
        resources: [
          "Book: 'The Linux Command Line' — Chapter 9 (Permissions), Chapter 16 (Networking)",
          "Lab: Intentionally misconfigure security settings on your VM, then use your auditor to find them",
          "Challenge: Run your auditor on an AWS free-tier EC2 instance — find at least 3 things to harden",
        ],
      },
    ],
  },
  {
    id: "phase2",
    title: "PHASE 2: Networking — The Language Everything Speaks",
    duration: "Weeks 7–11",
    color: "#3B82F6",
    icon: "🌐",
    totalHours: "~50 hours (1.5 hrs/day × 5 weeks)",
    whyFirst: "K8s is 60% networking. Cloud architecture IS networking. AI model serving, load balancing, service mesh — all networking. If packets are a mystery to you, you'll never debug production issues.",
    weeks: [
      {
        week: "Week 7",
        title: "IP, Subnets, Routing — The Foundation of All Networks",
        concepts: [
          "IPv4 addresses: 4 octets, dotted decimal, binary representation — be able to convert mentally",
          "Subnet masks and CIDR: /24 = 256 addresses, /16 = 65536, how to calculate network/broadcast address",
          "Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — why they exist",
          "Routing: how a packet decides where to go, routing tables ('ip route show'), default gateway",
          "NAT: how private IPs reach the internet, SNAT, DNAT, masquerade — this is how cloud networking works",
          "ARP: how IP addresses map to MAC addresses on a local network, ARP cache, ARP poisoning",
          "Network interfaces: ip addr, ip link — understanding eth0, lo, veth pairs (critical for containers)",
          "CIDR math: given 10.0.0.0/22, how many usable IPs? What's the range? Practice until instant.",
        ],
        scenarios: [
          "Two servers are on 10.0.1.0/24 and 10.0.2.0/24. They can't ping each other. Why? (No route between subnets — need a router/gateway)",
          "You're designing a VPC for a K8s cluster. You need: a public subnet for load balancers, a private subnet for worker nodes, and an isolated subnet for databases. Design the CIDR ranges.",
          "A pod on 10.244.1.5 needs to reach a pod on 10.244.2.8 (different node). Trace the packet path.",
        ],
        hardProject: {
          name: "Build a Network Topology Simulator in Bash",
          description: "Using Linux network namespaces (ip netns), create 3 isolated 'hosts' with their own network stacks. Connect them with virtual ethernet (veth) pairs through a 'router' namespace. Configure IP addresses, routes, and NAT so that Host A can ping Host B through the Router. Then add iptables rules to block specific traffic. This is EXACTLY how container networking works — you're building it from scratch.",
          skills: "ip netns, veth pairs, routing tables, iptables, NAT — the building blocks of Docker/K8s networking",
        },
        resources: [
          "Book: 'Computer Networking: A Top-Down Approach' by Kurose/Ross — Chapters 4-5 (or any networking fundamentals book)",
          "Tool: 'ip netns' on your Linux VM — this is your lab",
          "Practice: Subnetting drills — subnettingpractice.com until you can do /22 calculations in your head",
        ],
      },
      {
        week: "Week 8",
        title: "TCP, UDP, DNS — How Applications Talk",
        concepts: [
          "TCP 3-way handshake: SYN → SYN-ACK → ACK — understand every step",
          "TCP connection states: LISTEN, ESTABLISHED, TIME_WAIT, CLOSE_WAIT — 'ss -tnap' to see them",
          "TCP flow control: window size, congestion control, why TCP slows down on lossy networks",
          "UDP: connectionless, no guarantee — when it's better (DNS, video streaming, game servers, real-time AI inference)",
          "Ports: well-known (0-1023), ephemeral (49152-65535), how port binding works, SO_REUSEADDR",
          "DNS resolution flow: app → /etc/resolv.conf → recursive resolver → root → TLD → authoritative",
          "DNS record types: A, AAAA, CNAME, MX, TXT, SRV, PTR — when each is used",
          "DNS caching: TTL, /etc/hosts, nscd, systemd-resolved — why stale DNS causes outages",
          "Tools: dig, nslookup, tcpdump, ss, netstat — use each, understand the output",
        ],
        scenarios: [
          "Your server shows 20,000 connections in TIME_WAIT state. What does this mean? Is it a problem? How do you fix it?",
          "A microservice can reach 10.0.1.5:8080 by IP but 'curl myservice:8080' fails. Debug step by step. (DNS issue)",
          "tcpdump shows SYN packets going out but no SYN-ACK coming back. Three possible reasons?",
          "A DNS TTL is set to 3600 (1 hour). You change the IP. How long before everyone sees the change? Why is this a problem for deployments?",
        ],
        hardProject: {
          name: "Build a DNS Resolver From Scratch",
          description: "Write a script (Bash/Python) that resolves a domain name WITHOUT using dig, nslookup, or any DNS library. Manually send a UDP packet to 8.8.8.8 port 53 with a DNS query, parse the binary response, and print the IP address. This teaches you: UDP sockets, DNS wire format, binary protocol parsing, and why DNS is fundamental to everything.",
          skills: "DNS protocol internals, UDP sockets, binary parsing, network debugging",
        },
        resources: [
          "Tool: tcpdump — capture and analyze packets while browsing, curling, pinging",
          "Lab: Run 'tcpdump -i any port 53' and then browse the web — see every DNS query your machine makes",
          "Book: 'DNS and BIND' (first 4 chapters for fundamentals)",
        ],
      },
      {
        week: "Week 9",
        title: "HTTP, TLS, and Load Balancing",
        concepts: [
          "HTTP request/response cycle: method, URL, headers, body, status codes — use 'curl -v' to see raw HTTP",
          "Status codes: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error) — know 200, 201, 301, 302, 400, 401, 403, 404, 500, 502, 503, 504",
          "HTTP headers: Host, Content-Type, Authorization, Cache-Control, Connection (keep-alive)",
          "HTTPS and TLS: why encryption matters, TLS handshake (simplified), certificates, certificate chains, CA",
          "mTLS: mutual TLS — both client and server verify each other — critical for service-to-service in K8s",
          "Load balancing: L4 (TCP level) vs L7 (HTTP level), round-robin, least-connections, consistent hashing",
          "Reverse proxy: what nginx/HAProxy do — terminate TLS, route requests, add headers, cache",
          "HTTP/2: multiplexing, header compression, server push — why it's faster",
        ],
        scenarios: [
          "Users get 502 Bad Gateway. What does this mean exactly? (The load balancer/proxy connected to the backend but the backend returned an invalid response or was down)",
          "The difference between 502 and 504? When do you see each? (502 = bad response from upstream, 504 = upstream didn't respond in time)",
          "Design a load balancing strategy for 3 ML model servers: 2 run model v1, 1 runs model v2. How do you route 90% traffic to v1 and 10% to v2? (Weighted routing / canary)",
          "You need to debug why an API call is slow. The server logs show fast response but the client sees 5 second delay. Where's the latency hiding?",
        ],
        hardProject: {
          name: "Build a Reverse Proxy and Load Balancer From Scratch",
          description: "Write a Python script that listens on port 8080, accepts HTTP connections, and forwards them to one of 3 backend servers (round-robin). Add: health checks (remove unhealthy backends), request logging, and a /stats endpoint showing request counts per backend. No nginx, no HAProxy — raw sockets or Python's http.server. This is what production load balancers do.",
          skills: "HTTP protocol, TCP sockets, load balancing algorithms, health checking",
        },
        resources: [
          "Tool: 'curl -v' — use it for every API call, read the full HTTP exchange",
          "Lab: Set up nginx as a reverse proxy on your VM, configure upstream backends, break things and debug",
          "Tool: mkcert — create local TLS certificates, set up HTTPS locally",
        ],
      },
      {
        week: "Week 10-11",
        title: "Firewalls, iptables & Network Security + Capstone",
        concepts: [
          "iptables architecture: tables (filter, nat, mangle), chains (INPUT, OUTPUT, FORWARD, PREROUTING, POSTROUTING)",
          "Rules: -A (append), -I (insert), -D (delete), -j (jump to target: ACCEPT, DROP, REJECT, MASQUERADE)",
          "Stateful firewall: conntrack, ESTABLISHED/RELATED — why you allow responses to outgoing connections",
          "DNAT and SNAT: how port forwarding works, how K8s services use DNAT to reach pods",
          "Network namespaces: ip netns — each namespace has its own network stack (interfaces, routes, iptables)",
          "Bridge networking: how Docker bridge works — docker0 bridge, veth pairs, NAT via iptables",
          "VPNs: WireGuard basics — tunnel encrypted traffic between two points",
          "Network debugging toolkit: tcpdump, ss, ip, dig, traceroute, mtr, curl — use ALL of them fluently",
        ],
        scenarios: [
          "A K8s pod can reach the internet but external traffic can't reach the pod. Trace the iptables rules to understand why. (DNAT for NodePort/LoadBalancer, SNAT for outgoing)",
          "Two containers on the same host can't communicate. Debug at the namespace/bridge/iptables level.",
          "You want to block all outgoing traffic from a container except to port 443 (HTTPS). Write the iptables rules.",
          "A connection works from server A to B but not B to A. Why? (Stateful firewall: A's firewall allows outgoing + related responses, B's firewall blocks incoming)",
        ],
        hardProject: {
          name: "CAPSTONE: Build Your Own Container Network From Scratch",
          description: "This is the BIG one. Build a complete container networking setup using ONLY Linux primitives: (1) Create 3 network namespaces (simulating containers). (2) Create a bridge (simulating docker0). (3) Connect each namespace to the bridge using veth pairs. (4) Assign IP addresses to each. (5) Set up routing so they can talk to each other. (6) Set up NAT (iptables MASQUERADE) so they can reach the internet. (7) Set up DNAT so external traffic can reach one of them on a specific port. (8) Add firewall rules: ns1 can talk to ns2 but ns3 is isolated. This project IS Docker networking. When you finish this, you understand container networking better than 95% of DevOps engineers.",
          skills: "Network namespaces, bridges, veth pairs, iptables NAT, routing, firewall rules — THE foundation for K8s networking",
        },
        resources: [
          "Blog: 'Container Networking From Scratch' by Ivan Velichko — follow along then rebuild without looking",
          "Lab: Build the capstone project, then compare what you built with what 'docker network inspect bridge' shows — it's the same thing",
          "Tool: Wireshark/tcpdump — capture traffic at every hop in your network to verify it works",
        ],
      },
    ],
  },
  {
    id: "phase3",
    title: "PHASE 3: Compute, Programming & How Machines Think",
    duration: "Weeks 12–17",
    color: "#8B5CF6",
    icon: "💻",
    totalHours: "~60 hours (1.5 hrs/day × 6 weeks)",
    whyFirst: "You're heading toward AI Infra — which is ALL about compute. CPUs, GPUs, memory hierarchies, parallelism. And you need Python/Go to build real tools, not just read YAML configs. This phase turns you from a config editor into a builder.",
    weeks: [
      {
        week: "Week 12",
        title: "How CPUs and GPUs Actually Work",
        concepts: [
          "CPU architecture: cores, threads (hyperthreading), clock speed, instruction pipeline",
          "CPU cache hierarchy: L1 (per-core, ~1ns) → L2 (per-core, ~4ns) → L3 (shared, ~10ns) → RAM (~100ns)",
          "Why cache matters: cache miss = 100x slower, cache-friendly code, CPU cache lines (64 bytes)",
          "Context switching: what happens when OS switches between processes — register save/restore, TLB flush",
          "NUMA: Non-Uniform Memory Access — multi-socket servers where some RAM is 'closer' to some CPUs",
          "GPU architecture: thousands of simple cores vs few complex CPU cores, SIMD, parallel processing",
          "GPU memory: VRAM (on-GPU, fast), HBM, PCIe bandwidth (bottleneck between CPU and GPU)",
          "Why GPUs for ML: matrix multiplication is massively parallel, GPUs have thousands of cores for this",
          "NVLink: high-speed GPU-to-GPU communication (faster than PCIe), critical for multi-GPU training",
          "Tensor cores: specialized hardware for matrix ops in NVIDIA GPUs — why A100/H100 are special",
        ],
        scenarios: [
          "An ML training job runs at 30% GPU utilization. The GPU has 80GB VRAM but only 20GB is used. What's the bottleneck? (Likely CPU data preprocessing can't feed data fast enough — the CPU-GPU pipeline is starved)",
          "You have a 2-socket server with 256GB RAM (128GB per socket). A process running on socket 0 allocates 200GB. What happens? (NUMA: 128GB local, 72GB remote — remote memory access is slower)",
          "Your K8s pod has CPU limit of '2' but the app is single-threaded. Are you wasting resources?",
        ],
        hardProject: {
          name: "Build a CPU and Memory Profiler",
          description: "Write a Python script that monitors a given process: reads CPU usage from /proc/[PID]/stat, memory from /proc/[PID]/status (VmRSS, VmSize, VmSwap), counts context switches from /proc/[PID]/status, and reads CPU cache misses from perf (if available). Display as a real-time dashboard. Bonus: compare performance of a matrix multiplication in Python (single core) vs numpy (multi-core) and show the GPU utilization difference visually.",
          skills: "CPU/memory internals, /proc parsing, performance profiling, Python basics",
        },
        resources: [
          "Video: 'How a CPU Works' by Branch Education (YouTube, 20 min) — visual, excellent",
          "Video: 'GPU Architecture Explained' by Branch Education (YouTube)",
          "Book: 'Systems Performance' by Brendan Gregg — Chapter 6 (CPUs)",
        ],
      },
      {
        week: "Week 13-14",
        title: "Python — From Print Statement to Real Tools",
        concepts: [
          "Data types deep: int, float, str, bool, None — mutability, type conversion, truthiness",
          "Data structures: list (array), dict (hashmap), set, tuple — when to use each, time complexity",
          "Control flow: if/elif/else, for/while, break/continue, list comprehensions, dict comprehensions",
          "Functions: def, args, kwargs, default values, return vs print (critical difference), scope",
          "String formatting: f-strings, .format(), raw strings, multiline strings",
          "File I/O: open(), read(), readlines(), write(), 'with' statement (context manager), CSV, JSON",
          "Error handling: try/except/finally, raising exceptions, custom exceptions, don't catch broad Exception",
          "Modules and packages: import, from...import, __name__ == '__main__', creating packages",
          "Standard library essentials: os, sys, pathlib, subprocess, json, yaml, argparse, logging, datetime",
          "Classes basics: __init__, self, methods, inheritance — just enough to read K8s client code",
          "Virtual environments: venv, pip, requirements.txt, why isolation matters",
          "Type hints: basic annotations, why they matter for large codebases",
        ],
        scenarios: [
          "Read a YAML file (like a K8s manifest), extract all container image names, check if they use 'latest' tag (security risk), and output a report.",
          "Write a CLI tool using argparse that accepts --namespace and --label-selector flags and lists matching pods (mock data for now).",
          "Parse a 1GB log file without loading it entirely into memory. Find the top 10 most frequent error messages.",
        ],
        hardProject: {
          name: "Build a K8s Manifest Linter in Python",
          description: "Write a Python CLI tool that reads Kubernetes YAML manifests and checks for common mistakes: containers running as root, no resource limits set, using 'latest' image tag, no liveness/readiness probes, privileged mode enabled, hostNetwork true. Output findings with severity (ERROR/WARNING/INFO). Accept a directory of YAML files. This is a real tool that K8s teams use (like kubelinter) — you're building it from scratch.",
          skills: "YAML parsing, file I/O, CLI arguments, data structures, real-world K8s knowledge application",
        },
        resources: [
          "Book: 'Automate the Boring Stuff with Python' (free online) — Chapters 1-12",
          "Practice: Do NOT use ChatGPT/Copilot while learning. Type every line. Read error messages. Debug manually.",
          "Lab: Solve 20 problems on exercism.io (Python track) — not LeetCode, practical problems",
        ],
      },
      {
        week: "Week 15-16",
        title: "Containers Deep — Build One Without Docker",
        concepts: [
          "What a container really IS: just a Linux process with namespaces + cgroups + a filesystem",
          "Namespaces: PID (isolated process tree), NET (isolated network stack), MNT (isolated filesystem), UTS (isolated hostname), IPC (isolated inter-process communication), USER (isolated user/group IDs)",
          "Creating namespaces: unshare command — run a process in a new namespace",
          "cgroups v2: resource limits — cpu.max, memory.max, io.max — create them in /sys/fs/cgroup",
          "OverlayFS: how container images layers work — lowerdir (read-only) + upperdir (write) = merged view",
          "chroot vs pivot_root: changing the root filesystem for a process",
          "Container image: just a tarball of a filesystem + metadata (OCI image spec)",
          "Container runtime chain: kubelet → CRI → containerd → runc → your process",
          "runc: the actual tool that creates containers — it calls clone() with namespace flags and sets up cgroups",
          "NVIDIA container runtime: extends runc to mount GPU devices and drivers into the container",
        ],
        scenarios: [
          "A container uses 4GB memory but the cgroup limit is 2GB. What happens exactly? (cgroup OOM kill — different from kernel OOM kill)",
          "'docker exec' into a container — what is this actually doing at the namespace level? (nsenter into existing namespaces)",
          "A GPU container can't see any GPUs. Debug at the device level. (Check: nvidia-smi in host, NVIDIA runtime configured, device mounts in container)",
        ],
        hardProject: {
          name: "THE ULTIMATE PROJECT: Build a Container From Scratch (No Docker)",
          description: "Build a working container using ONLY Linux system calls. Step by step: (1) Download a rootfs (alpine minirootfs tarball). (2) Use 'unshare' to create new PID + NET + MNT + UTS namespaces. (3) Use 'pivot_root' to switch to the new rootfs. (4) Set up /proc mount inside. (5) Set up networking: create veth pair, put one end in container namespace, connect other to host bridge. (6) Create a cgroup and set memory limit (e.g., 100MB) and CPU limit. (7) Run a process inside — it should see its own PID 1, own hostname, own network, and be limited by cgroups. You just built Docker. From scratch. On a single Linux VM.",
          skills: "Namespaces, cgroups, pivot_root, OverlayFS, veth pairs, bridge networking — the ENTIRE container stack",
        },
        resources: [
          "Blog: 'Linux Containers in 500 Lines of Code' by Liz Rice (also a conference talk on YouTube)",
          "Book: 'Container Security' by Liz Rice — Chapters 1-4",
          "Lab: Your Ubuntu VM is all you need. Everything is built into the Linux kernel.",
        ],
      },
      {
        week: "Week 17",
        title: "Distributed Systems Fundamentals",
        concepts: [
          "Why distributed systems: single machine has limits (CPU, RAM, disk, network) — scale out",
          "CAP theorem: you can only guarantee 2 of 3 — Consistency, Availability, Partition tolerance. In reality, partitions WILL happen, so you choose CP or AP.",
          "Consensus: how multiple machines agree on a value — Raft algorithm (used by etcd in K8s)",
          "Leader election: one node is the leader, others are followers — what happens when leader dies",
          "Replication: keeping copies of data on multiple machines — sync vs async, trade-offs",
          "Eventual consistency: data will be consistent EVENTUALLY but might be stale temporarily",
          "Idempotency: doing the same operation twice gives the same result — critical for retries",
          "Message queues: decouple producers from consumers — at-least-once, at-most-once, exactly-once delivery",
          "Observability: metrics (what's happening NOW), logs (what happened), traces (path of a request across services)",
          "Failure modes: network partition, node crash, split brain, cascading failure, thundering herd",
        ],
        scenarios: [
          "You have a 3-node etcd cluster. One node dies. Can K8s still work? (Yes — 2/3 is quorum). Two die? (No — 1/3 is not quorum, cluster is read-only)",
          "An ML pipeline processes messages from a queue. It crashes halfway through processing a message. When it restarts, should it reprocess that message? (Yes — at-least-once, but make the processing idempotent)",
          "Two users update the same model configuration at the same time in different regions. Who wins? Design a conflict resolution strategy.",
        ],
        hardProject: {
          name: "Build a Simple Distributed Key-Value Store",
          description: "Write a Python application that runs on 3 separate processes (simulating 3 servers). They communicate via HTTP. Implement: PUT/GET/DELETE operations, leader election (one process accepts writes, others are read-only), replication (leader sends updates to followers), and handle leader failure (followers detect leader is down, elect new leader). No external libraries for consensus — write the logic yourself. This is fundamentally how etcd works.",
          skills: "Consensus, replication, leader election, failure detection, HTTP APIs, distributed state",
        },
        resources: [
          "Paper: 'In Search of an Understandable Consensus Algorithm' (Raft paper) — read the first 8 pages",
          "Video: 'Raft Visualization' at thesecretlivesofdata.com/raft — interactive, beautiful",
          "Book: 'Designing Data-Intensive Applications' by Martin Kleppmann — Chapters 5, 8, 9",
        ],
      },
    ],
  },
  {
    id: "phase4",
    title: "PHASE 4: Git, Security & The Capstone That Ties Everything",
    duration: "Weeks 18–20",
    color: "#10B981",
    icon: "🏆",
    totalHours: "~30 hours (1.5 hrs/day × 3 weeks)",
    whyFirst: "Final pieces before you're ready for K8s, Terraform, and AI Infra. Git internals for GitOps. Security for production readiness. And a capstone that proves you've absorbed everything.",
    weeks: [
      {
        week: "Week 18",
        title: "Git Internals & Security Fundamentals",
        concepts: [
          "Git objects: blob (file content), tree (directory), commit (snapshot + parent + message), tag",
          "How commit works internally: hash content → create blob → create tree → create commit object → update ref",
          "Branches: just a pointer (file in .git/refs/heads/) to a commit hash — branching is instant",
          "Merge vs rebase: merge creates a merge commit, rebase replays commits — trade-offs in team workflows",
          "Reflog: git's undo history — recover from almost any mistake",
          "Security: TLS everywhere, secrets management (never in git), RBAC (who can do what), least privilege",
          "Cryptography basics: symmetric (AES) vs asymmetric (RSA/Ed25519), hashing (SHA256), digital signatures",
          "Supply chain security: image scanning, SBOMs, signed commits, signed container images",
        ],
        scenarios: [
          "You accidentally force-pushed and lost 3 days of team commits. Recover them. (reflog + cherry-pick)",
          "A .env file with database passwords was committed 50 commits ago. How do you remove it from ALL history? (git filter-branch or BFG repo cleaner — but the secret is already compromised)",
          "Design a GitOps workflow: changes go through PR → review → merge → auto-deploy. How do you handle secrets that can't be in the repo?",
        ],
        hardProject: {
          name: "Build a Git Implementation From Scratch",
          description: "Write a Python script that implements the core of Git: (1) 'init' — create .mygit directory with objects/ and refs/. (2) 'add' — hash file contents (SHA1), store as blob in objects/. (3) 'commit' — create tree object from staged files, create commit object with parent reference. (4) 'log' — walk the commit chain and print history. (5) 'branch' — create a new ref pointing to current commit. You'll understand that Git is just a content-addressable filesystem with a DAG on top. It's simple once you build it.",
          skills: "Hashing, file I/O, DAG data structure, content-addressable storage",
        },
        resources: [
          "Book: 'Pro Git' by Scott Chacon (free) — Chapter 10 (Git Internals)",
          "Blog: 'Write yourself a Git' by Thibault Polge — step by step implementation",
          "Lab: Explore .git/ directory manually — read objects with 'git cat-file -p'",
        ],
      },
      {
        week: "Week 19-20",
        title: "FINAL CAPSTONE: Build a Mini Platform-as-a-Service",
        concepts: [
          "This project combines EVERYTHING from 20 weeks into one system",
        ],
        scenarios: [
          "A user deploys an app but it crashes. Debug through your entire stack: container, network, resources, logs.",
          "Two apps need to communicate. Verify network routing works through your bridge/iptables setup.",
          "An app exceeds memory limit. Verify cgroups enforcement. Check logs for OOM messages.",
        ],
        hardProject: {
          name: "Build a Mini PaaS: Your Own Tiny Heroku Using Only Linux Primitives",
          description: "Build a platform that accepts a user's application (a simple Python/Node app), packages it, and runs it in an isolated environment — ALL built from scratch using everything you learned. Components: (1) CONTAINER RUNTIME: Using namespaces, cgroups, pivot_root — isolate the app process with resource limits (Week 15-16 project evolved). (2) NETWORKING: Each 'container' gets its own network namespace, connected via bridge, with port mapping via iptables DNAT so users can reach the app from outside (Week 10-11 capstone evolved). (3) PROCESS SUPERVISOR: Monitor the app process, restart on crash, collect exit codes and logs (Week 5 project evolved). (4) DEPLOYMENT PIPELINE: A Bash/Python script that takes a git repo URL, clones it, creates a rootfs with dependencies, and 'deploys' it to your runtime (Week 18 + Week 4 combined). (5) HEALTH CHECKS: HTTP health check endpoint, mark unhealthy apps, auto-restart (Week 9 project concepts). (6) SIMPLE LOAD BALANCER: If 2 instances of an app run, round-robin traffic between them (Week 9 project evolved). (7) MONITORING: Collect CPU/memory/network metrics per container from /proc and cgroups, display dashboard (Week 2-3 projects evolved). (8) SECURITY: Apps run as non-root, minimal capabilities, network isolation between apps (Week 6 + Week 10 concepts). This is Kubernetes. Simplified. Built by you. From scratch. When you build this, K8s will feel like 'oh, I already built a basic version of this.' That's the power of fundamentals.",
          skills: "Linux (all of it), networking (all of it), containers (from scratch), process management, security, programming, distributed concepts",
        },
        resources: [
          "No tutorial for this — you ARE the tutorial now. Use everything from the last 18 weeks.",
          "Reference: Look at how 'dokku' (mini-Heroku) works — but build yours from primitives, not their code",
          "Celebrate: When this works, you've proven you understand the entire stack. K8s, Terraform, AI Infra — you're ready.",
        ],
      },
    ],
  },
];

const AFTER_ROADMAP = {
  title: "AFTER WEEK 20: What Changes",
  items: [
    "K8s → You'll learn it 3x faster because you already built container networking, process isolation, and a simple orchestrator",
    "Terraform → You'll understand what it's actually doing (API calls to cloud providers that create VMs, networks, firewalls — things you already understand)",
    "AI Infra → GPU orchestration on K8s makes sense because you understand GPU hardware, container runtimes, and resource scheduling",
    "MLOps → ML pipelines are just distributed systems with queues, compute jobs, and storage — you built a simplified version",
    "Debugging → You can trace any problem from application → container → network → kernel → hardware. No black boxes.",
    "Interviews → You can whiteboard any system design question because you understand the building blocks",
  ]
};

function App() {
  const [expandedPhase, setExpandedPhase] = useState("phase1");
  const [expandedWeek, setExpandedWeek] = useState("Week 1");

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "#07070b",
      color: "#e0ddd8",
      minHeight: "100vh",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "32px 20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(239,68,68,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#EF4444", fontWeight: 600, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            20-WEEK FUNDAMENTALS ROADMAP · 1-2 HRS/DAY · HARD WAY ONLY
          </div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, margin: "0 0 8px 0", color: "#fff", lineHeight: 1.3 }}>
            The "Never Come Back" Roadmap
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.6 }}>
            Every concept. Every debug scenario. Every hard-way project. Built for someone at 3-4/10 who wants to reach 9/10 and never revisit. No shortcuts. No single-line commands. You build everything from scratch.
          </p>
          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "rgba(239,68,68,0.06)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)",
            fontSize: 12, color: "#ccc", lineHeight: 1.6,
          }}>
            <strong style={{ color: "#EF4444" }}>The Rule:</strong> Every week has a "hard-way project." You don't move to the next week until you complete it. No Docker. No K8s. No Terraform. Just Linux, networking, and your brain. The advanced tools come AFTER you understand what they're abstracting.
          </div>
        </div>
      </div>

      {/* Timeline Overview */}
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {PHASES.map(p => (
            <button key={p.id} onClick={() => { setExpandedPhase(p.id); setExpandedWeek(p.weeks[0].week); }} style={{
              padding: "10px 14px",
              background: expandedPhase === p.id ? `${p.color}12` : "rgba(255,255,255,0.02)",
              border: expandedPhase === p.id ? `1px solid ${p.color}35` : "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", minWidth: 0, flex: "1 1 0",
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{p.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: p.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>{p.duration}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{p.title.split(":")[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Phase Content */}
      {PHASES.filter(p => p.id === expandedPhase).map(phase => (
        <div key={phase.id} style={{ maxWidth: 840, margin: "0 auto", padding: "0 20px 40px" }}>
          {/* Phase Header */}
          <div style={{
            padding: "16px 20px",
            background: `${phase.color}06`,
            borderRadius: 10,
            border: `1px solid ${phase.color}20`,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: phase.color, marginBottom: 4 }}>{phase.title}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{phase.totalHours}</div>
            <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{phase.whyFirst}</div>
          </div>

          {/* Week Tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
            {phase.weeks.map(w => (
              <button key={w.week} onClick={() => setExpandedWeek(w.week)} style={{
                padding: "6px 12px",
                background: expandedWeek === w.week ? `${phase.color}18` : "rgba(255,255,255,0.02)",
                border: expandedWeek === w.week ? `1px solid ${phase.color}40` : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 6, cursor: "pointer", fontSize: 11, color: expandedWeek === w.week ? phase.color : "#777",
                fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              }}>
                {w.week}
              </button>
            ))}
          </div>

          {/* Week Content */}
          {phase.weeks.filter(w => w.week === expandedWeek).map(week => (
            <div key={week.week}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {week.week}: {week.title}
              </div>

              {/* Concepts */}
              <div style={{
                marginTop: 16, padding: "16px 18px",
                background: "rgba(255,255,255,0.015)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: phase.color, letterSpacing: 1.5, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                  CONCEPTS TO LEARN ({week.concepts.length})
                </div>
                {week.concepts.map((c, i) => (
                  <div key={i} style={{
                    padding: "8px 0",
                    borderBottom: i < week.concepts.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ color: phase.color, fontSize: 8, marginTop: 6, flexShrink: 0 }}>●</span>
                    <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>{c}</span>
                  </div>
                ))}
              </div>

              {/* Debug Scenarios */}
              <div style={{
                marginTop: 12, padding: "16px 18px",
                background: "rgba(249,115,22,0.04)", borderRadius: 10,
                border: "1px solid rgba(249,115,22,0.12)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#F97316", letterSpacing: 1.5, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                  🧪 DEBUG SCENARIOS — Can you solve these? ({week.scenarios.length})
                </div>
                {week.scenarios.map((s, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", marginBottom: 6,
                    background: "rgba(0,0,0,0.2)", borderRadius: 6,
                    border: "1px solid rgba(249,115,22,0.08)",
                    fontSize: 13, color: "#ccc", lineHeight: 1.6,
                  }}>
                    <span style={{ color: "#F97316", fontWeight: 700, marginRight: 6 }}>S{i + 1}.</span>{s}
                  </div>
                ))}
              </div>

              {/* Hard Way Project */}
              <div style={{
                marginTop: 12, padding: "18px 18px",
                background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
                borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: 1.5, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  🔨 HARD WAY PROJECT — Build it. No shortcuts.
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{week.hardProject.name}</div>
                <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7, marginBottom: 10 }}>{week.hardProject.description}</div>
                <div style={{
                  fontSize: 11, color: phase.color, padding: "6px 10px",
                  background: `${phase.color}08`, borderRadius: 4, display: "inline-block",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Skills proven: {week.hardProject.skills}
                </div>
              </div>

              {/* Resources */}
              <div style={{
                marginTop: 12, padding: "14px 18px",
                background: "rgba(255,255,255,0.015)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: 1.5, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                  📚 RESOURCES
                </div>
                {week.resources.map((r, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#999", lineHeight: 1.6, marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.06)" }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* After Roadmap */}
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)",
          borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#10B981", marginBottom: 12 }}>
            ✅ {AFTER_ROADMAP.title}
          </div>
          {AFTER_ROADMAP.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ color: "#10B981", fontSize: 8, marginTop: 6, flexShrink: 0 }}>●</span>
              <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: "16px 20px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
            20 weeks. 1-2 hours/day. Zero shortcuts.
          </div>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
            After this, you don't "know about" Linux, networking, and containers. You've <strong style={{ color: "#F97316" }}>built</strong> them. From scratch.
            That's a fundamentally different engineer than someone who just used Docker and K8s.
            That's the engineer who gets hired at ₹40-70 LPA or $200K+ remote.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
