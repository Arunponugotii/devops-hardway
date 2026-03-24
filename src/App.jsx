import { useState } from "react";

const PHASES = [
  {
    id: "p1", title: "PHASE 1: Linux — Own the Machine", duration: "Weeks 1–9", color: "#F97316", icon: "🐧",
    hours: "~95 hrs", summary: "9 weeks. From 'I know cd and ls' to 'I can trace any problem to the kernel.' No gaps.",
    weeks: [
      { week: "W1", title: "Files, Directories, Permissions & The Shell", concepts: [
        "Shell vs terminal vs console — what each actually is",
        "Absolute vs relative paths, ~ . .. meaning, pwd, which, whereis",
        "File types: regular (-), directory (d), symlink (l), block (b), char (c), socket (s), pipe (p) — ls -la every column",
        "Inodes: every file has one — inode number, metadata stored in inode, hard links share inodes, 'ls -i', 'df -i'",
        "Hard links vs soft links — at inode level. Why hard links can't cross filesystems. Why deleting original breaks symlink but not hardlink",
        "Permissions: rwx for user/group/other, octal (755, 644, 600), chmod, chown, chgrp",
        "Special permissions: SUID (run as owner), SGID (run as group / inherit group on dir), Sticky bit (only owner can delete in dir like /tmp)",
        "umask: default permission mask — why new files get 644 not 666",
        "stdin (fd 0), stdout (fd 1), stderr (fd 2) — everything is a file descriptor",
        "Redirection: > >> 2> 2>&1 &> /dev/null, here documents (<<EOF)",
        "Pipes: | — stdout of one becomes stdin of next. Named pipes (FIFOs): mkfifo",
        "Filesystem Hierarchy Standard: / /etc /var /tmp /opt /usr /home /proc /sys /dev — what each is for, where to look when debugging",
        "Globbing: * ? [] {} — pattern matching in shell (different from regex)",
      ],
      scenarios: [
        "File shows -rwSr--r-- — what does capital S mean? Is this dangerous? (SUID set but no execute permission — S means SUID without x, likely misconfigured)",
        "You created thousands of tiny log files. 'df' shows 40% disk used but you can't create new files. Why? How to fix? (Inode exhaustion — find and delete tiny files, check with df -i)",
        "A script works when you run 'bash script.sh' but fails with './script.sh'. Why? (Missing execute permission or wrong shebang line)",
        "You need to find all SUID binaries on the system. One command. Why is this a security audit step?",
      ],
      project: { name: "Build Your Own 'ls -la' From /proc and stat", desc: "Script that reads file metadata using stat command and /proc filesystem. Display permissions (convert octal to rwx string), owner, group, size, modification time, filename, symlink target. Handle hidden files, sort options (-S for size, -t for time). Understand what metadata the kernel stores for every file." },
      resources: ["Book: 'The Linux Command Line' by William Shotts (free PDF) — Ch 1-10", "Lab: Ubuntu VM on VirtualBox. Do EVERYTHING in terminal, no GUI for 9 weeks.", "Practice: overthewire.org/wargames/bandit/ — Levels 0-20"]
      },
      { week: "W2", title: "Processes, Signals & File Descriptors Deep", concepts: [
        "What IS a process: running program with its own PID, address space, file descriptor table, environment",
        "fork() and exec(): how EVERY process is created. fork copies parent, exec replaces with new program",
        "Process tree: pstree, parent-child relationship, PPID, orphan adoption by PID 1",
        "PID 1 (init/systemd): ancestor of all processes. The PID 1 problem in containers — no default signal handling, zombie reaping",
        "Process states: R (running), S (sleeping/interruptible), D (uninterruptible sleep — usually disk I/O), T (stopped), Z (zombie)",
        "Zombie processes: child died but parent hasn't called wait(). How to find: ps aux | grep Z. Fix: kill the parent, not the zombie",
        "Foreground/background: &, jobs, fg, bg, Ctrl+Z (SIGTSTP), Ctrl+C (SIGINT)",
        "nohup and disown: keep process running after terminal closes. tmux/screen for persistent sessions",
        "Signals deep: SIGTERM (15, graceful), SIGKILL (9, force), SIGHUP (1, hangup/reload), SIGINT (2, interrupt), SIGSTOP/SIGCONT (pause/resume), SIGCHLD (child died), SIGUSR1/2 (custom)",
        "Why kill -9 is last resort: no cleanup — temp files remain, locks held, connections not closed, transactions incomplete",
        "File descriptors deep: every open file/socket/pipe is an fd. /proc/PID/fd shows all. lsof lists all open files system-wide",
        "File descriptor limits: ulimit -n (per-process), fs.file-max (system-wide). 'Too many open files' error — what it means and how to fix",
        "File descriptor leaks: process opens files/sockets but never closes them. Eventually hits limit and crashes",
        "/proc/PID deep: /status (state, memory), /cmdline (full command), /environ (env vars), /fd (open files), /maps (memory map), /io (I/O stats)",
        "Environment variables: how they work, how they propagate (fork inherits, exec can modify), export, env, printenv, PATH, HOME, LANG",
        "Process priority: nice (-20 to 19), renice, ionice for I/O priority",
      ],
      scenarios: [
        "Production app has 50 zombie processes. ps shows parent PID 3421. Explain exactly what happened and the fix. What if the parent IS PID 1?",
        "A process shows state 'D' (uninterruptible sleep) and you can't kill it even with SIGKILL. What's happening? (Stuck in kernel I/O — usually disk/NFS problem. Fix the underlying I/O issue)",
        "Your app crashes with 'Too many open files'. Current limit is 1024. Process has 1020 fds open. Where are they going? Debug with /proc/PID/fd and lsof.",
        "You SSH in, start training job, SSH disconnects. Job dies. Next time you use tmux. Job survives. Explain exactly why at the process/signal level (SIGHUP)",
        "An app reads DATABASE_URL env var but gets empty string inside a container. It works on your machine. Why? (Env vars don't magically propagate — container has its own environment)",
      ],
      project: { name: "Build a Process Monitor & Watchdog", desc: "Read /proc for every running process. Display: PID, name, state, RSS memory, CPU time, open file descriptor count, parent PID. Refresh every 2 seconds. Add watchdog mode: give it a PID, it monitors the process, if it dies (detect via /proc/PID disappearing), it logs the event, checks exit code, and optionally restarts it. Handle the PID 1 zombie reaping problem. This is what systemd and container init systems do." },
      resources: ["Book: 'How Linux Works' by Brian Ward — Ch 8", "Lab: Run stress-ng, deliberately fill fd table, create zombies, practice debugging each", "Tool: tmux — learn it this week, use it every day after"]
      },
      { week: "W3", title: "Memory, Storage, Kernel Parameters & Limits", concepts: [
        "Virtual memory: each process gets its own address space (illusion of having all RAM). MMU translates virtual→physical addresses",
        "Page table: maps virtual pages to physical frames. TLB (Translation Lookaside Buffer) caches recent translations",
        "RSS (Resident Set Size): actual physical RAM used. VSZ (Virtual Size): total virtual memory allocated. RSS is what matters for limits",
        "Page cache: Linux uses ALL free RAM as disk cache. This is why 'free' shows high 'used' but it's fine. 'available' is what matters",
        "Buffers vs cache in 'free' output: buffers = filesystem metadata cache, cache = file content cache",
        "Swap: overflow area when RAM is full. Swap on SSD is much faster than HDD. vm.swappiness controls how eagerly Linux swaps",
        "OOM Killer: when truly out of memory, kernel picks a process to kill. oom_score (calculated), oom_score_adj (-1000 to 1000, set by admin)",
        "Memory-mapped files (mmap): map a file directly into process address space. Appears in VSZ but may not use RSS. ML models often use mmap",
        "/proc/meminfo: total, free, available, buffers, cached, swap — understand every line",
        "/proc/PID/smaps: detailed memory breakdown per mapping — the definitive answer for 'where is memory going'",
        "Block devices: /dev/sda, /dev/nvme0n1 — HDD vs SSD (SATA) vs NVMe naming",
        "Filesystems: ext4 (default, journaling), xfs (high performance, large files), tmpfs (RAM-based, /tmp)",
        "Mount: attaching a filesystem to the directory tree. mount, umount, /etc/fstab for persistent mounts, mount options (noatime, noexec)",
        "LVM: Physical Volumes → Volume Groups → Logical Volumes. Why: resize without unmounting, snapshots, thin provisioning",
        "I/O monitoring: iostat (disk util, await, IOPS), iotop (per-process I/O), blktrace for deep analysis",
        "Kernel parameters (sysctl): /proc/sys, sysctl -a, /etc/sysctl.conf for persistent changes",
        "Critical sysctls: vm.swappiness, fs.file-max, net.core.somaxconn, net.ipv4.ip_forward, vm.overcommit_memory",
        "ulimit deep: -n (open files), -u (max processes), -v (virtual memory), -l (locked memory — critical for GPU/RDMA). /etc/security/limits.conf for persistent limits",
        "Disk encryption: LUKS concept, dm-crypt — data at rest encryption. Cloud disks use this transparently",
      ],
      scenarios: [
        "Server has 16GB RAM. 'free' shows 14GB used, 200MB free. Team panics. Is there a problem? Explain using 'available' vs 'used'. (Page cache — available might be 10GB. No problem)",
        "Container is OOM killed at 1.5GB limit, but app shows only 800MB heap. Where's the other 700MB? (Native memory, mmap'd files, shared libraries, thread stacks — check /proc/PID/smaps)",
        "Database is slow. iostat shows disk at 100% utilization, await is 50ms. The disk is NVMe (should be <1ms). What's wrong? (Too many random small I/O operations overwhelming even NVMe queue depth)",
        "You set vm.swappiness=0 on a server thinking 'no swap ever.' System OOM kills your database. Why? (swappiness=0 doesn't disable swap, it means 'only swap when absolutely necessary' — by then it's too late, OOM killer activates)",
        "GPU training job needs locked memory (mlock) but gets 'Cannot allocate memory'. ulimit -l shows 64KB. Fix it. Why does GPU/RDMA need locked memory? (DMA requires pages that don't get swapped out)",
      ],
      project: { name: "Build a System Health Dashboard with Alert Engine", desc: "Read /proc/meminfo, /proc/diskstats, /proc/loadavg, all /proc/PID/status. Display: memory breakdown (total/used/cache/available/swap), per-disk IOPS and throughput and utilization, CPU load averages, top 5 memory consumers with RSS/VSZ/swap breakdown. Add alert rules: memory available < 10%, disk util > 90%, swap usage > 50%, any process oom_score > 800. Output alerts with severity. Bonus: check key sysctl values and warn if they're at defaults." },
      resources: ["Book: 'Systems Performance' by Brendan Gregg — Ch 6 (CPUs), Ch 7 (Memory), Ch 9 (Disks)", "Lab: Use stress-ng to fill memory, watch OOM killer via dmesg. Change oom_score_adj to protect a process", "Command: Learn to read 'free -h', /proc/meminfo, iostat -x 1 fluently"]
      },
      { week: "W4", title: "Text Processing — grep, sed, awk, regex, find", concepts: [
        "grep basics: -i (case insensitive), -r (recursive), -n (line numbers), -c (count), -l (filenames only), -v (invert)",
        "grep regex: . (any char), * (zero or more), + (one or more), ? (optional), ^ (start), $ (end), [] (char class), | (or)",
        "grep extended regex (-E): groups (), alternation |, quantifiers {n,m}, \\b (word boundary)",
        "grep practical: search logs for error patterns, extract IPs, find config values, search code",
        "sed: stream editor — s/old/new/ (substitute), s/old/new/g (global), -i (in-place edit), addresses (line numbers, ranges, patterns)",
        "sed advanced: delete lines (d), insert/append (i/a), hold space, multi-line operations",
        "awk: column-based processing. awk '{print $1, $3}' = print columns 1 and 3. -F for delimiter. Built-in variables: NR (line number), NF (field count), $NF (last field)",
        "awk programming: BEGIN/END blocks, variables, if/else, arrays, functions. awk is a full programming language",
        "Regular expressions deep: character classes (\\d, \\w, \\s), lookahead/lookbehind, greedy vs lazy quantifiers, capturing groups",
        "sort, uniq, cut, tr, wc, head, tail, tee — the Unix pipeline toolkit",
        "xargs: convert stdin to arguments. Find + xargs pattern. Parallel execution with -P",
        "find deep: -name, -type, -size, -mtime, -perm, -user, -exec vs -exec +, -maxdepth, combining with -and/-or/-not",
        "diff, comm, paste, join — comparing and combining files",
        "jq: JSON processing from command line — essential for K8s, cloud APIs, any modern tooling",
      ],
      scenarios: [
        "Extract all unique IP addresses from a 5GB nginx access log, count requests per IP, show top 20 — one pipeline. Then filter only IPs that made more than 1000 requests in the last hour.",
        "A config file has 200 lines with KEY=VALUE format. Change all values for keys starting with 'DB_' to 'REDACTED'. Use sed.",
        "Parse K8s pod JSON output (kubectl get pods -o json) with jq: list all pods where status is not Running, show pod name, namespace, and restart count.",
        "Find all Python files in a project that import 'requests' library but don't have 'timeout' in the same file. (Potential bug: HTTP calls without timeout)",
        "A CSV has 1 million rows. Extract rows where column 3 (timestamp) is within the last 24 hours and column 5 (status) is 'ERROR'. Show count per unique value in column 4 (service name). Use awk.",
      ],
      project: { name: "Build a Log Analysis Engine", desc: "Process nginx/application log files with pure shell tools. Features: (1) Parse any common log format (auto-detect nginx, Apache, JSON logs). (2) Time-range filtering (last 1h, last 24h, custom range). (3) Top N analysis: IPs, URLs, status codes, user agents, response time percentiles. (4) Error rate calculation per minute with spike detection. (5) Slow request detection (response time > threshold). (6) Output as formatted table or JSON (--json flag). All using grep, sed, awk, sort, uniq — no Python, no external tools. This is a real production tool many SREs build." },
      resources: ["Book: 'Sed & Awk' by Dale Dougherty (O'Reilly)", "Practice: Grab real nginx logs (generate with your VM's web server) and analyze them", "Tool: regex101.com — practice regex with visual explanation until you can read them fluently"]
      },
      { week: "W5", title: "Bash Scripting, Automation & Daily Tools", concepts: [
        "Variables: declaring, quoting rules ('literal' vs \"expand $var\" vs `command` vs $(command))",
        "Exit codes: $? (last exit code), 0 = success, non-zero = failure. Every command returns one. set -e to exit on failure",
        "Conditionals: if/elif/else, [[ ]] (preferred over [ ]), -f/-d/-z/-n/-eq/-ne/-gt/-lt, && || operators",
        "Loops: for item in list, for ((i=0; i<10; i++)), while read line, until, break, continue",
        "Functions: function_name() { }, local variables, return (exit code) vs echo (output), function libraries",
        "Arrays: indexed arrays, associative arrays (declare -A), iteration, ${#arr[@]} for length",
        "String manipulation: ${var#pattern} (remove prefix), ${var%pattern} (remove suffix), ${var/old/new}, ${var:-default}, ${#var}",
        "Error handling: set -euo pipefail (the holy trinity), trap 'cleanup' EXIT ERR, error functions",
        "Input: read, $1 $2 $@ $# for positional args, getopts for flags, heredocs for multi-line input",
        "Subshells: $() runs in subshell — variable changes don't propagate back. Process substitution: <(command)",
        "Debugging: set -x (trace), bash -x script.sh, PS4 for custom trace prefix",
        "Cron deep: crontab syntax (min hour dom month dow), cron environment (PATH is different!), cron logging, preventing overlapping runs with flock",
        "Systemd timers vs cron: OnCalendar syntax, Persistent=true (catch up missed runs), journalctl for timer logs",
        "tmux/screen: sessions, windows, panes, detach/attach, copy mode, tmux.conf customization",
        "Compression: tar (archive), gzip/gunzip (.gz, fast), bzip2 (.bz2, better ratio), xz (.xz, best ratio, slow), zstd (.zst, fast + good ratio — modern choice). tar czf, tar xzf",
        "Makefile basics: targets, dependencies, recipes, variables, .PHONY. Used in every serious project",
      ],
      scenarios: [
        "Write a deployment script: takes app name and version, pulls from registry, stops old version gracefully (SIGTERM, wait 30s, SIGKILL), starts new version, health checks for 60s, auto-rollback if health check fails. Full error handling.",
        "A cron job runs at midnight but fails silently. No logs anywhere. Debug. (Cron doesn't load .bashrc, PATH is different, stdout/stderr go to /dev/null, redirect to a log file)",
        "Two instances of the same backup script run simultaneously and corrupt the backup. Fix with flock.",
        "Your Bash script works interactively but fails in CI/CD. Why? (No TTY, different PATH, different user, different env vars, set -e catches errors that were silently ignored)",
      ],
      project: { name: "Build a Complete Deployment Toolkit", desc: "A set of production-grade Bash scripts: (1) deploy.sh: pull image, stop old, start new, health check, rollback on failure. (2) backup.sh: compress and rotate backups, flock for single instance, upload to remote. (3) monitor.sh: systemd timer that checks all services every 5 min, alerts on failure. (4) setup.sh: bootstrap a fresh server — install packages, create users, set kernel params, configure firewall, set up SSH keys. All with: getopts for flags, proper error handling, logging, dry-run mode, colored output. Include a Makefile that runs tests and linting (shellcheck) on all scripts." },
      resources: ["Book: 'The Linux Command Line' — Part 4 (Shell Scripting)", "Tool: shellcheck — install it, run on every script, fix every warning", "Rule: Type every script from scratch. No copy-paste. Read error messages fully."]
      },
      { week: "W6", title: "Kernel Internals — strace, syscalls, modules, shared libs", concepts: [
        "System calls: the ONLY way a process talks to the kernel. open(), read(), write(), close(), fork(), exec(), mmap(), socket(), connect()",
        "strace: traces every syscall a process makes. strace -p PID (attach to running), strace -f (follow forks), strace -e trace=network (filter), strace -c (syscall summary with timing)",
        "ltrace: traces library calls (libc functions like malloc, printf). Shows you what the app is doing at the library level",
        "How strace saves you: app hangs → strace shows it's stuck on read() from a socket → network problem. App crashes → strace shows SIGSEGV after mmap() → memory issue. App slow → strace -c shows 90% time in write() → I/O bottleneck",
        "Shared libraries (.so files): code shared between programs. libc.so is used by almost everything",
        "ldd: shows shared library dependencies of a binary. ldd /usr/bin/python3 → lists every .so it needs",
        "LD_LIBRARY_PATH: where to look for .so files. ldconfig: rebuild library cache. Why containers often have 'library not found' errors",
        "Static vs dynamic linking: static = all code included in binary (larger, portable), dynamic = loads .so at runtime (smaller, needs correct libs). Go compiles statically by default (great for containers). Python/C use dynamic (need careful container images)",
        "Kernel modules: loadable kernel code. lsmod (list), modprobe (load), rmmod (remove), modinfo (details), dmesg (kernel log)",
        "NVIDIA kernel modules: nvidia.ko, nvidia-uvm.ko, nvidia-modeset.ko. When nvidia-smi fails, check: lsmod | grep nvidia, dmesg for errors",
        "dmesg: kernel ring buffer — OOM kills, hardware errors, driver problems, disk errors ALL show here before anywhere else. dmesg -T for timestamps, dmesg -w for live",
        "Package management internals: dpkg (Debian/Ubuntu low-level), apt (high-level wrapper), how dependency resolution works, dpkg -L (list package files), dpkg -S (find which package owns a file)",
        "Building from source: ./configure, make, make install — what each step does. Why you sometimes need to compile from source (specific version, custom flags, unavailable in repos)",
        "Filesystem hierarchy for libraries: /lib, /usr/lib, /usr/local/lib, /opt — where packages install things",
      ],
      scenarios: [
        "An app hangs completely. No logs. No errors. PID exists but doesn't respond. Use strace to find it's stuck on futex() (lock contention) or read() on a socket (waiting for network response). Now you know the root cause.",
        "Container image works on Ubuntu but fails on Alpine with 'not found' error for a binary that clearly exists. Why? (Alpine uses musl libc, Ubuntu uses glibc — binary was dynamically linked against glibc. Use ldd to verify. Fix: static binary or multi-stage build with correct base)",
        "After kernel update, nvidia-smi shows 'driver not loaded.' Debug. (Kernel module was built for old kernel. Check dmesg, modprobe nvidia, DKMS for automatic rebuilds)",
        "strace -c shows your Python app spends 70% of CPU time in stat() syscalls — calling stat thousands of times per second. What's causing this? (Likely Python import system checking file existence, or a library scanning directories. Fix: optimize imports, cache file checks)",
        "A compiled binary segfaults on a new server. Works everywhere else. strace shows it crashes right after loading libcrypto.so. What do you check? (Library version mismatch — ldd shows which version, compare with working server)",
      ],
      project: { name: "Build a System Call Tracer (Simplified strace)", desc: "Write a Bash/Python wrapper that uses strace on a target process and produces a human-readable report: (1) Top syscalls by count and time. (2) All file operations (which files opened, read, written, how much data). (3) All network operations (which IPs/ports connected, data transferred). (4) All signals received. (5) Library dependency check (ldd analysis). Run it on common tools: ls, curl, python script, nginx — see what they actually do at the kernel level. You'll never look at a process the same way again." },
      resources: ["Book: 'Systems Performance' by Brendan Gregg — Ch 4 (Observability Tools)", "Blog: 'strace — The Sysadmin's Microscope' by Brendan Gregg", "Lab: strace everything. Run strace on ls, cat, curl, python. See what they really do."]
      },
      { week: "W7", title: "Linux Networking Tools & Performance Profiling", concepts: [
        "ip command suite: ip addr (interfaces), ip route (routing table), ip link (link layer), ip neigh (ARP table) — replaces ifconfig/route",
        "ss (socket statistics): ss -tlnp (listening TCP), ss -tnap (all TCP connections), ss -s (summary). Replaces netstat. Faster, more info",
        "lsof -i: list all network connections with process info. lsof -i :8080 (who's using port 8080)",
        "tcpdump: capture packets. tcpdump -i any port 80 (all HTTP traffic), tcpdump -i eth0 host 10.0.1.5 (traffic to/from IP), -w file.pcap (save for Wireshark), -nn (don't resolve names)",
        "nc (netcat): Swiss army knife. nc -l 8080 (listen), nc host 8080 (connect), port scanning, file transfer, testing connectivity",
        "curl deep: -v (verbose), -H (headers), -d (POST data), -X (method), -o (output), -w (format output: time_total, http_code), -k (skip TLS verify)",
        "dig deep: +short, +trace (full resolution path), @server (query specific DNS), ANY/A/AAAA/MX/TXT record queries",
        "traceroute/mtr: trace packet path, identify which hop is slow or dropping. mtr combines ping + traceroute",
        "Network socket concept: IP:port pair. Socket types: STREAM (TCP), DGRAM (UDP), RAW. /proc/net/tcp and /proc/net/udp show all sockets",
        "Unix domain sockets: inter-process communication on same host. Docker daemon uses /var/run/docker.sock. K8s CRI uses Unix sockets. Faster than TCP localhost",
        "Time synchronization: chrony/ntpd, why clock drift breaks distributed systems (certificate validation, log correlation, database replication), timedatectl",
        "Performance profiling methodology: USE method — for every resource (CPU, memory, disk, network) check Utilization, Saturation, Errors",
        "perf: Linux profiler. perf top (live hotspots), perf record + perf report (detailed profile), perf stat (CPU counters)",
        "Flamegraphs: visual representation of where CPU time is spent. perf record → stackcollapse-perf.pl → flamegraph.pl",
        "vmstat: virtual memory stats — processes, memory, swap, I/O, system, CPU columns. vmstat 1 for per-second updates",
        "mpstat: per-CPU stats — identifies if one CPU is overloaded while others idle (common with single-threaded apps)",
        "pidstat: per-process CPU/memory/I/O stats. pidstat -d 1 (disk I/O per process)",
        "sar: System Activity Reporter — historical performance data. When 'it was slow yesterday at 3am' you use sar to see what happened",
      ],
      scenarios: [
        "Port 8080 is 'already in use' but your app isn't running. Find what's holding it. (ss -tlnp | grep 8080, or lsof -i :8080. Could be TIME_WAIT from previous instance)",
        "A pod can reach external IPs but DNS resolution fails. Debug step by step using dig, /etc/resolv.conf, checking CoreDNS pods",
        "Application is slow. CPU shows 30% utilization. Memory is fine. Disk is fine. Where's the bottleneck? (Use perf top to see if it's lock contention, or strace to see if it's waiting on network. Run a flamegraph to see exactly where time is spent)",
        "Network throughput between two servers is 100Mbps but the NIC is 10Gbps. Use iperf3 to test raw bandwidth. If raw is fine, the app is the bottleneck. If raw is slow, check MTU, duplex settings, switch configuration",
        "Production server was slow at 3 AM. Nobody was awake. How do you investigate now at 10 AM? (sar -u for CPU, sar -r for memory, sar -d for disk from that time period. Check dmesg for kernel events. Check journalctl for service errors around that time)",
      ],
      project: { name: "Build a Network & Performance Diagnostic Suite", desc: "A comprehensive diagnostic tool: (1) Network health: check all listening ports, active connections, DNS resolution speed, ping latency to key endpoints, traceroute to external targets. (2) Performance snapshot: CPU (per-core), memory (with page cache breakdown), disk (per-device IOPS/util), network (bytes in/out per interface). (3) Historical comparison: save snapshots to files, compare current vs previous (detect changes). (4) Connection analysis: top talkers (IPs with most connections), connections per state (ESTABLISHED/TIME_WAIT/CLOSE_WAIT), detect connection leaks. (5) Output both human-readable table and JSON. This is the tool you'll wish existed at 2 AM during an incident." },
      resources: ["Book: 'Systems Performance' by Brendan Gregg — Ch 10 (Network), Ch 2 (Methodology/USE method)", "Tool: Install and use iperf3, mtr, tcpdump on your VM pair (make 2 VMs that talk to each other)", "Video: Brendan Gregg's 'Linux Performance Tools' talk (YouTube, ~45 min)"]
      },
      { week: "W8", title: "Systemd, Services & Boot Process", concepts: [
        "Boot: BIOS/UEFI → GRUB → kernel (vmlinuz) → initramfs (temporary root to find real root) → systemd (PID 1) → targets → services",
        "Systemd unit file anatomy: [Unit] (description, dependencies), [Service] (exec, restart, type, user, limits), [Install] (wanted-by target)",
        "Service types: simple (default, ExecStart IS the service), forking (forks to background, need PIDFile), oneshot (runs once and exits), notify (service tells systemd when ready)",
        "Dependencies: After= (ordering only), Requires= (hard dependency, co-fail), Wants= (soft dependency), BindsTo= (stronger Requires)",
        "Restart policies: Restart=always/on-failure/on-abnormal, RestartSec=, StartLimitBurst= + StartLimitIntervalSec= (prevent restart loops)",
        "Resource limits in systemd: MemoryMax=, CPUQuota= (e.g., 200% = 2 cores), IOWeight=, LimitNOFILE= (file descriptors), LimitMEMLOCK= (locked memory for GPU)",
        "Targets: multi-user.target (text mode), graphical.target (GUI), default.target. systemctl get-default, systemctl isolate",
        "journalctl deep: -u service (by service), --since/--until (time range), -p err (by priority), -b (current boot), -f (follow/live), --no-pager, -o json",
        "Socket activation: ListenStream=, Accept=. Service starts ONLY when connection arrives. Saves resources. Used by many system services",
        "Timer units: OnCalendar= (cron-like), OnBootSec= (after boot), Persistent=true (run missed timers on next boot), AccuracySec=",
        "Drop-in overrides: /etc/systemd/system/service.d/override.conf — modify vendor units without editing originals. systemctl edit service",
        "systemctl commands: start, stop, restart, reload, enable, disable, status, is-active, is-enabled, daemon-reload, list-units, list-timers",
      ],
      scenarios: [
        "Write a unit file from scratch: Python web app, start after network+database, run as non-root user 'appuser', restart on crash (max 5 in 60s), memory limit 512MB, CPU limit 150%, 65536 file descriptor limit, log to journald, environment from /etc/app/env file",
        "A service shows 'activating (auto-restart)' in a loop. journalctl shows 'start-limit-hit'. Explain and fix. (RestartSec too fast, StartLimitBurst exceeded. Increase RestartSec or StartLimitIntervalSec)",
        "You need a script to run every 15 min but NEVER if previous run is still in progress. Write a systemd timer+service. (Type=oneshot, timer with OnCalendar, systemd handles single-instance)",
        "After deploying a new version, systemctl start app shows success but the app isn't actually serving traffic. Why? (Type=simple starts instantly even if app needs 10s to initialize. Use Type=notify with sd_notify, or add ExecStartPost health check)",
      ],
      project: { name: "Build a Mini Service Manager (Your Own Init)", desc: "Write a process supervisor in Bash: (1) Read a config file listing services (name, command, restart policy, health check URL). (2) Start all services as background processes, track PIDs. (3) Monitor loop: check if each process is alive, restart if dead based on policy. (4) Health checking: HTTP check, restart if unhealthy. (5) Graceful shutdown: SIGTERM → wait → SIGKILL. (6) Log all events with timestamps. (7) Handle signals: SIGTERM to supervisor triggers graceful shutdown of all services. This IS what PID 1 does in a container. You'll understand exactly why tini/dumb-init exists." },
      resources: ["Man pages: systemd.service(5), systemd.timer(5), journalctl(1)", "Lab: Write 3 different unit files for real apps. Break them intentionally. Debug with journalctl", "Understand: After this week, you should be able to manage any Linux server's services confidently"]
      },
      { week: "W9", title: "Security, Hardening & Phase 1 Capstone", concepts: [
        "Users/groups: /etc/passwd (user info), /etc/shadow (password hashes), /etc/group. useradd, usermod, groupadd, id",
        "Root vs non-root: principle of least privilege. sudo, /etc/sudoers, visudo, sudoers.d/. Never run services as root",
        "SSH deep: key-based auth (Ed25519 preferred), ssh-keygen, ~/.ssh/authorized_keys, ssh_config, agent forwarding, ProxyJump (bastion host)",
        "SSH hardening: disable password auth, disable root login, change port (minor), AllowUsers/AllowGroups, fail2ban",
        "Linux capabilities: fine-grained root privileges. cap_net_bind_service (bind ports <1024), cap_sys_admin (too broad — avoid), setcap, getcap",
        "SELinux/AppArmor: Mandatory Access Control — even root can be restricted. Contexts, profiles, enforcing vs permissive mode",
        "File integrity: checksums (sha256sum), tripwire concept, detecting unauthorized changes",
        "Common attack vectors: world-writable files, SUID binaries on unexpected programs, open ports, weak SSH config, unpatched software, /etc/shadow readable by non-root",
        "Audit checklist: users with shell access, SUID/SGID binaries, listening ports, cron jobs, sudo permissions, world-writable directories, kernel version/patches",
        "Secrets in environment: never hardcode passwords, use environment variables or secret stores, but also understand env vars are visible in /proc/PID/environ",
      ],
      scenarios: [
        "An attacker got shell as www-data user. What can they access? How do you limit blast radius? (Check sudo rights, readable files, SUID binaries, network access from that user. Principle: services should have minimal permissions)",
        "Web app needs port 80 but shouldn't run as root. Three different solutions. (1: setcap cap_net_bind_service. 2: reverse proxy on 80 forwarding to high port. 3: systemd socket activation)",
        "You inherit a server with zero documentation. Perform a complete security audit. List all commands you'd run and what you're looking for.",
        "A container runs as root with SYS_ADMIN capability and host network. List every security problem and the fix for each.",
      ],
      project: { name: "PHASE 1 CAPSTONE: Linux Security Auditor + System Report Generator", desc: "Build a comprehensive system auditor that checks EVERYTHING from 9 weeks: (1) System info: kernel version, uptime, boot time, loaded modules. (2) Users: all users with login shells, passwordless sudo, recently created accounts. (3) Security: SUID/SGID binaries, world-writable files, open ports with owning processes, SSH config weaknesses, firewall status. (4) Performance: CPU/memory/disk/swap current state, kernel parameter audit (compare against recommended values). (5) Processes: zombie processes, high-memory processes, high-fd-count processes, processes running as root that shouldn't be. (6) Network: all connections, listening ports, DNS resolution test, NTP sync status. (7) Output: formatted report with severity levels (CRITICAL/WARNING/INFO/OK), JSON output option, summary score out of 100. This single project touches every concept from weeks 1-9. If you can build it, you own Linux." },
      resources: ["Book: 'Linux Security Cookbook' (for reference patterns)", "Lab: Run your auditor on a fresh AWS EC2 instance — you'll find at least 5 things to fix", "Final test: Can you set up a fresh Linux server from scratch, secure it, and audit it — without Googling anything?"]
      },
    ]
  },
  {
    id: "p2", title: "PHASE 2: Networking — The Invisible Layer", duration: "Weeks 10–16", color: "#3B82F6", icon: "🌐",
    hours: "~75 hrs", summary: "7 weeks. Overlay networks, gRPC, network performance, RDMA concepts — everything K8s and AI Infra need.",
    weeks: [
      { week: "W10", title: "IP, Subnets, Routing & ARP", concepts: [
        "IPv4: 4 octets, binary conversion, network vs host portion, broadcast address",
        "CIDR: /24=256, /16=65536, /22=1024. Calculate range, usable IPs, network/broadcast instantly",
        "Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. RFC 1918. Why NAT exists",
        "Routing: routing table (ip route), default gateway, longest prefix match, static routes",
        "NAT: SNAT (source NAT — private→public), DNAT (destination NAT — port forwarding). MASQUERADE (dynamic SNAT)",
        "ARP: IP→MAC resolution on local network. ARP cache (ip neigh). ARP is L2, IP is L3",
        "DHCP: automatic IP assignment. DORA (Discover, Offer, Request, Acknowledge). lease time, reservations",
        "Network interfaces: physical (eth0), loopback (lo), virtual (veth pairs), bridges, bonds, VLANs",
        "MTU: Maximum Transmission Unit. Default 1500 bytes. Jumbo frames (9000). Path MTU Discovery. Why MTU matters for overlays (overhead reduces effective MTU)",
      ],
      scenarios: [
        "Design VPC: public subnet (load balancers), private subnet (app servers), isolated subnet (databases). CIDR blocks, routing between them, NAT gateway for private→internet",
        "Two servers on different subnets can't ping. ip route shows no route. Add the route. Explain why switches handle same-subnet but routers handle cross-subnet",
        "K8s pod on 10.244.1.5 needs to reach pod on 10.244.2.8 (different node). Trace the full packet path including any overlay encapsulation",
        "You set MTU to 9000 on servers but some packets are lost. Why? (Switch/router between them still at 1500. Jumbo frames get fragmented or dropped. All devices in path need same MTU)",
      ],
      project: { name: "Build a Multi-Subnet Network Using Linux Namespaces", desc: "Create 4 network namespaces: 2 'servers' on subnet 10.0.1.0/24, 2 'servers' on 10.0.2.0/24, and a 'router' namespace connecting both subnets. Set up routing so all can reach each other through the router. Add NAT so the internal networks can reach the host's internet. Add DHCP (using dnsmasq) in the router namespace. This is a complete network topology built from scratch." },
      resources: ["Subnetting drill: subnettingpractice.com — do 50 problems until instant", "Lab: All work done with 'ip netns' on your Linux VM", "Book: 'Computer Networking: A Top-Down Approach' — Ch 4-5"]
      },
      { week: "W11", title: "TCP, UDP & DNS Deep", concepts: [
        "TCP 3-way handshake: SYN → SYN-ACK → ACK. sequence numbers, acknowledgment numbers",
        "TCP states: LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED, FIN_WAIT_1/2, TIME_WAIT, CLOSE_WAIT, LAST_ACK, CLOSED",
        "TIME_WAIT: lasts 2*MSL (usually 60s). Why it exists (delayed packets). When thousands of TIME_WAIT is a problem vs normal",
        "CLOSE_WAIT: means YOUR app didn't close the connection. Always a bug in your code, not the OS",
        "TCP flow control: window size, sliding window. Congestion control: slow start, congestion avoidance",
        "TCP Nagle's algorithm: batch small writes. TCP_NODELAY to disable for latency-sensitive apps (like real-time inference)",
        "UDP: no connection, no guarantee, no ordering. When to use: DNS, video streaming, real-time inference, game servers, QUIC",
        "DNS resolution flow: app → /etc/nsswitch.conf → /etc/hosts → /etc/resolv.conf → recursive resolver → root → TLD → authoritative → cache",
        "DNS record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification), SRV (service discovery — used by K8s), PTR (reverse)",
        "DNS caching: TTL, negative caching, nscd/systemd-resolved, why stale DNS causes outages during deployments",
        "CoreDNS: K8s DNS server. service.namespace.svc.cluster.local resolution. ndots:5 configuration and why it causes excessive DNS queries",
      ],
      scenarios: [
        "Server shows 20,000 TIME_WAIT connections. Is this a problem? When is it? How to fix? (Usually normal for high-traffic servers. Problem if ephemeral ports exhausted. Fix: SO_REUSEADDR, connection pooling, or tcp_tw_reuse)",
        "App shows 500 CLOSE_WAIT connections that keep growing. What's happening? (App isn't closing connections. Memory/fd leak. Eventually crashes. Fix the app code.)",
        "K8s pod DNS is slow. Every HTTP call takes extra 100ms. Debug. (Check ndots:5 — pod tries 5 search domains before external lookup. Fix: use FQDN with trailing dot, or reduce ndots)",
        "You changed a DNS record 30 min ago but some clients still see old IP. Why? How to force update? (TTL caching at multiple levels. Can't force clients. Wait for TTL. Lesson: lower TTL BEFORE making changes)",
      ],
      project: { name: "Build a DNS Resolver and TCP Connection Analyzer", desc: "Two tools: (1) DNS resolver: send raw UDP packets to DNS server (8.8.8.8:53), parse binary response, display all records. Support A, AAAA, CNAME, MX queries. Implement simple caching with TTL. (2) TCP analyzer: monitor all TCP connections on the system, display per-state counts (ESTABLISHED, TIME_WAIT, CLOSE_WAIT), alert on anomalies (CLOSE_WAIT growing, ephemeral port exhaustion approaching), show top connections by duration and data transferred." },
      resources: ["Tool: tcpdump -i any port 53 — watch every DNS query your system makes", "Lab: Set up your own DNS server (bind9 or dnsmasq) in a namespace, configure custom zones", "RFC 1035: Read the DNS spec header format — it's surprisingly short and educational"]
      },
      { week: "W12", title: "HTTP, TLS, gRPC & Load Balancing", concepts: [
        "HTTP request/response: method, path, version, headers, body. Status codes: 200/201/301/302/400/401/403/404/500/502/503/504",
        "HTTP headers that matter: Host, Content-Type, Authorization, Cache-Control, Connection, X-Forwarded-For, X-Request-ID",
        "HTTPS: HTTP over TLS. Certificate chain: server cert → intermediate CA → root CA. Certificate validation process",
        "TLS 1.3 handshake: 1 round trip (vs 2 in TLS 1.2). Key exchange (ECDHE), cipher selection, perfect forward secrecy",
        "mTLS: both sides present certificates. Client cert + server cert. How service meshes (Istio) use mTLS for zero-trust",
        "HTTP/2: multiplexing (multiple requests on one connection), header compression, binary framing. Why faster than HTTP/1.1",
        "gRPC: built on HTTP/2 + Protocol Buffers. Bidirectional streaming. Used by: K8s API internals, AI model serving (Triton, TF Serving), etcd. Much faster than REST for service-to-service",
        "Protocol Buffers (protobuf): binary serialization. Schema defined in .proto files. Smaller and faster than JSON. Used with gRPC",
        "WebSockets: persistent full-duplex connection. Upgrade from HTTP. Used for: real-time AI inference streaming, chat, monitoring dashboards",
        "Load balancing: L4 (TCP: fast, no request inspection) vs L7 (HTTP: can route by URL/header, more features, slightly slower)",
        "LB algorithms: round-robin, weighted round-robin, least-connections, IP hash, consistent hashing (critical for caching/session affinity)",
        "Health checks: active (LB periodically checks /health) vs passive (LB monitors response codes from real traffic)",
        "Reverse proxy pattern: nginx/HAProxy/envoy — TLS termination, routing, caching, rate limiting, circuit breaking",
      ],
      scenarios: [
        "Users get 502 vs 504: explain the difference precisely. When does each occur? (502: upstream returned invalid response or connection refused. 504: upstream didn't respond within timeout. 502 = app crashed, 504 = app is too slow)",
        "An AI model inference endpoint has 3 backends with different GPU capacities. Design load balancing: don't send equal traffic, account for response time differences. (Weighted least-connections based on GPU capability)",
        "gRPC calls fail through a load balancer with HTTP/1.1. Why? How to fix? (gRPC requires HTTP/2. Configure LB to support HTTP/2 upstream, or use L4 load balancing to pass through)",
        "Client sends request, server processes in 50ms, but client sees 2s response time. Where is the latency? (DNS resolution, TLS handshake, connection establishment, network round trip, LB processing, queue wait. Use curl -w to measure each phase)",
      ],
      project: { name: "Build a Reverse Proxy, Load Balancer & gRPC Echo Service", desc: "Three components: (1) A Python load balancer that accepts HTTP connections on port 8080, forwards to 3 backends (round-robin + health checks, remove unhealthy backends). Add /stats endpoint showing request counts, error rates, avg latency per backend. (2) A simple gRPC echo service using Python grpcio — define a proto, implement server, write client. Understand how binary protocol differs from JSON. (3) Set up TLS on your load balancer using self-signed certs (mkcert). Full chain: client → HTTPS → your LB → HTTP → backends." },
      resources: ["Tool: curl -v -w '@format.txt' for detailed timing breakdown of every request", "Lab: Install nginx, configure as reverse proxy with upstreams, break backends and watch failover", "Tool: grpcurl — like curl but for gRPC. Test gRPC services from command line"]
      },
      { week: "W13", title: "Firewalls, iptables & NAT Deep", concepts: [
        "iptables architecture: tables (filter, nat, mangle, raw), chains (INPUT/OUTPUT/FORWARD/PREROUTING/POSTROUTING), rules, targets",
        "Packet flow through iptables: PREROUTING → routing decision → FORWARD/INPUT → local process → OUTPUT → POSTROUTING",
        "Rules: -A (append), -I (insert), -D (delete), -j (target: ACCEPT, DROP, REJECT, MASQUERADE, DNAT, SNAT, LOG)",
        "Connection tracking (conntrack): stateful firewall. States: NEW, ESTABLISHED, RELATED, INVALID. Why you accept ESTABLISHED,RELATED",
        "DNAT: change destination — how K8s NodePort works (external:30080 → pod:8080). iptables -t nat -A PREROUTING -p tcp --dport 30080 -j DNAT --to-destination POD_IP:8080",
        "SNAT/MASQUERADE: change source — how pods reach internet (pod IP → node IP). MASQUERADE auto-selects source IP",
        "nftables: successor to iptables. Same concepts, cleaner syntax. Understanding iptables transfers to nftables",
        "K8s and iptables: kube-proxy creates iptables rules for every Service. ClusterIP → random DNAT to pod IPs. NodePort → DNAT from node port to pod",
        "Debug iptables: iptables -L -n -v (list with counters), iptables -t nat -L -n -v (NAT rules), conntrack -L (connection table)",
        "Common patterns: allow SSH from specific IP, allow HTTP/HTTPS, block everything else, rate limiting, logging dropped packets",
      ],
      scenarios: [
        "K8s pod can reach internet but external traffic can't reach the pod's service. Trace the iptables rules to understand ClusterIP vs NodePort vs LoadBalancer",
        "After adding a new iptables rule, existing connections still work but new connections are blocked. Why? (Conntrack: existing connections are ESTABLISHED and allowed by a rule before the new DROP rule)",
        "You want to block all outgoing traffic from a container except ports 443 and 53 (HTTPS and DNS). Write the complete iptables rules",
        "iptables -L shows 50,000 rules (K8s with 5000 services). Performance degrades. Why? What's the alternative? (Linear chain walking is O(n). Alternative: IPVS mode in kube-proxy uses hash table, O(1) lookup)",
      ],
      project: { name: "Build a Stateful Firewall with NAT Gateway", desc: "In your network namespace lab: (1) Create 'internal' network (3 namespaces) and 'external' network (1 namespace simulating internet). (2) Create a 'firewall' namespace connecting both. (3) Implement: SNAT for internal→external traffic, DNAT for specific port forwarding, stateful rules (allow ESTABLISHED,RELATED), rate limiting (--limit), logging of dropped packets, blocklist (drop traffic from specific IPs). (4) Verify with tcpdump at every hop that packets are being translated correctly." },
      resources: ["Blog: 'A Deep Dive into Iptables and Netfilter Architecture' by DigitalOcean", "Lab: Run 'iptables -t nat -L -n -v' on a K8s node — read every rule and understand what it does", "Tool: conntrack -L to see the connection tracking table — see NAT translations in real time"]
      },
      { week: "W14", title: "Overlay Networks, VXLAN & Service Discovery", concepts: [
        "Overlay networks: virtual networks on top of physical networks. Why: containers on different hosts need a flat network",
        "VXLAN: encapsulates L2 frame inside UDP packet. VNID (24-bit) allows millions of virtual networks. Adds 50-byte overhead",
        "How K8s CNI uses VXLAN: Pod A (node 1) → veth → bridge → VXLAN encap → UDP to node 2 → VXLAN decap → bridge → veth → Pod B",
        "CNI (Container Network Interface): standard for K8s networking plugins. Calico, Flannel, Cilium, Weave — all implement CNI",
        "Flannel: simple VXLAN overlay. Each node gets a /24 subnet. Simple but limited (no network policies)",
        "Calico: BGP-based routing (no overlay overhead in some modes) + network policies. More complex, better performance",
        "Cilium: eBPF-based networking. Bypass iptables entirely for better performance. The modern choice",
        "Service discovery: how services find each other. DNS-based (K8s default: CoreDNS), registry-based (Consul, etcd)",
        "K8s service types: ClusterIP (internal), NodePort (external via node ports), LoadBalancer (cloud LB), ExternalName (DNS alias)",
        "Headless services: no ClusterIP, DNS returns all pod IPs directly. Used for stateful workloads (databases, distributed training)",
        "Endpoints and EndpointSlices: how K8s tracks which pods belong to which service",
      ],
      scenarios: [
        "Latency between two pods on different nodes is 5ms higher than between VMs on the same nodes. Why? (VXLAN encap/decap overhead + MTU reduction causing fragmentation. Fix: use Calico in direct routing mode, or increase MTU to account for VXLAN 50-byte overhead)",
        "A network policy blocks all ingress to a namespace, but pods inside can still reach each other. Why? (Network policy applies to ingress from outside, not intra-namespace by default. Need explicit policy for intra-namespace isolation)",
        "You're running distributed ML training across 8 nodes. Which CNI gives best performance? Why? (Calico direct mode or Cilium — avoid VXLAN overhead for high-bandwidth GPU traffic. Or use host networking for training pods)",
      ],
      project: { name: "Build a VXLAN Overlay Network", desc: "Using network namespaces on TWO VMs (or two separate namespace trees on one VM): (1) Create pods (namespaces) on each host. (2) Set up VXLAN tunnel between hosts using 'ip link add type vxlan'. (3) Create bridges on each host connected to VXLAN device. (4) Connect pods to bridges. (5) Verify pods on different hosts can ping each other through the VXLAN tunnel. (6) Use tcpdump to capture the encapsulated packets and see the VXLAN header wrapping the inner packet. This is EXACTLY what Flannel does. You just built a CNI plugin." },
      resources: ["Blog: 'VXLAN & Linux' by Vincent Bernat — excellent deep dive", "Lab: Need 2 VMs or 2 EC2 instances for this project (or simulate with nested namespaces)", "Read: K8s networking model documentation — understand the flat network requirement"]
      },
      { week: "W15", title: "Network Performance, RDMA & Debugging Methodology", concepts: [
        "Bandwidth vs latency vs throughput: bandwidth = pipe width, latency = pipe length, throughput = actual data delivered (limited by both)",
        "Bandwidth-delay product: amount of data 'in flight'. Large BDP networks need larger TCP windows",
        "Jumbo frames (MTU 9000): reduces per-packet overhead, critical for high-throughput AI training traffic. All devices in path must support",
        "Network debugging methodology: work up the layers. L1 (cable/link up?), L2 (ARP works?), L3 (ping/route works?), L4 (TCP connects?), L7 (HTTP returns correctly?). Stop at the broken layer",
        "iperf3: test raw network bandwidth. iperf3 -s (server), iperf3 -c server (client). Measure TCP and UDP throughput",
        "RDMA: Remote Direct Memory Access. Data transfer bypasses CPU entirely — NIC reads/writes directly to/from application memory. 10x less latency than TCP",
        "InfiniBand: high-speed interconnect for HPC/AI. 100-400 Gbps. Uses RDMA natively. Different from Ethernet",
        "RoCE (RDMA over Converged Ethernet): RDMA on regular Ethernet. Needs lossless Ethernet (PFC/ECN). Cheaper than InfiniBand",
        "NCCL (NVIDIA Collective Communication Library): handles GPU-to-GPU communication for distributed training. Uses NVLink (intra-node) and RDMA/InfiniBand (inter-node)",
        "AllReduce: the core distributed training operation. Every GPU sends gradients, receives aggregated result. Network is the bottleneck",
        "Network troubleshooting tools recap: ping (L3), traceroute/mtr (path), ss (connections), tcpdump (packets), iperf3 (bandwidth), dig (DNS), curl (HTTP)",
      ],
      scenarios: [
        "Distributed training across 8 nodes is only 4x faster than single node (should be ~7x). Where's the bottleneck? (Network bandwidth during AllReduce. Check: NCCL debug logs, iperf3 between nodes, verify RDMA/InfiniBand is active not falling back to TCP, check for NVLink usage intra-node)",
        "iperf3 shows 25Gbps between two servers but your app only achieves 2Gbps. Why? (App-level overhead: small packet sizes, no connection pooling, TLS overhead, serialization/deserialization, single-threaded networking. Test with different message sizes in iperf3)",
        "Two pods communicate fine for hours, then suddenly packets drop for 30 seconds, then recover. Intermittent. How to debug? (Could be: conntrack table full, switch/router issue, node resource pressure dropping packets. Check conntrack -S for drops, dmesg for network errors, node CPU/memory)",
      ],
      project: { name: "Build a Network Benchmarking & Debugging Toolkit", desc: "A comprehensive network testing tool: (1) Layered connectivity test: for a given target, test L3 (ping), L4 (TCP connect to port), L7 (HTTP request), report where it fails. (2) Bandwidth test: wrapper around iperf3 that tests multiple stream counts and reports optimal throughput. (3) Latency profiler: measure and graph latency over time (detect jitter and spikes). (4) MTU discovery: find the maximum MTU between two points without fragmentation. (5) Connection table health: conntrack utilization, per-state counts, detect anomalies. (6) DNS performance: test resolution time for multiple nameservers, detect slow DNS." },
      resources: ["Book: 'High Performance Browser Networking' by Ilya Grigorik (free online) — networking performance fundamentals", "Video: NVIDIA NCCL documentation — understand AllReduce and how GPU communication works at network level", "Lab: Set up iperf3 between two VMs, test with different MTU settings, see the throughput difference"]
      },
      { week: "W16", title: "PHASE 2 CAPSTONE: Build Container Networking from Scratch", concepts: [
        "Everything from weeks 10-15 combined into one system",
      ],
      scenarios: [
        "Container on Host A can't reach container on Host B through your VXLAN. Debug at each layer: namespace, bridge, VXLAN tunnel, host routing",
        "Port forwarding works for TCP but not UDP. Trace the iptables rules to find the gap",
        "Container can reach external IPs but DNS fails. Check your NAT rules, DNS forwarding, and /etc/resolv.conf inside the namespace",
      ],
      project: { name: "CAPSTONE: Complete Container Network Stack", desc: "Build the entire container networking stack: (1) TWO 'hosts' (could be two VMs or simulated). (2) On each host: create 3 container namespaces, a bridge, veth pairs connecting containers to bridge, IP assignment. (3) VXLAN tunnel between hosts so containers can cross-host communicate. (4) NAT: containers can reach internet. (5) DNAT: port forwarding so external traffic reaches specific containers. (6) Network policies: container A can talk to B but not C (using iptables per-namespace). (7) DNS: run dnsmasq as a DNS server — containers resolve each other by name. (8) Health monitoring: check if each container's network is working. This is Kubernetes networking. Simplified. Built by you." },
      resources: ["Blog: 'Container Networking From Scratch' by Ivan Velichko", "Validation: Compare your setup with 'docker network inspect bridge' — the concepts are identical", "Celebrate: After this, K8s networking will make complete sense"]
      },
    ]
  },
  {
    id: "p3", title: "PHASE 3: Compute, Programming & Containers", duration: "Weeks 17–24", color: "#8B5CF6", icon: "💻",
    hours: "~85 hrs", summary: "8 weeks. CPU/GPU deep, Python proper, Go reading, containers from scratch, GPU containers, distributed systems.",
    weeks: [
      { week: "W17", title: "CPU, GPU & Memory Architecture", concepts: [
        "CPU: cores, threads (hyperthreading), clock speed, pipeline, branch prediction, out-of-order execution",
        "CPU cache: L1 (~1ns, 64KB per core) → L2 (~4ns, 256KB per core) → L3 (~10ns, shared 8-30MB) → RAM (~100ns, GBs) → SSD (~100μs) → HDD (~10ms)",
        "Cache lines (64 bytes), cache-friendly access patterns, false sharing in multi-threaded code",
        "Context switching: save/restore registers + TLB flush. Cost: 1-10μs. Why too many threads hurts performance",
        "NUMA: multi-socket servers. Each socket has 'local' RAM (fast) and 'remote' RAM (slow). numactl, numastat",
        "CPU cgroups: cpu.max for limits, cpu.weight for shares. K8s CPU requests/limits map to cgroups. CPU throttling: what it looks like, how to detect",
        "GPU architecture: thousands of simple cores (CUDA cores) vs CPU's few complex cores. SIMT (Single Instruction Multiple Threads)",
        "GPU memory: VRAM (HBM on high-end). A100: 40/80GB, H100: 80GB. VRAM is separate from system RAM. PCIe bandwidth is the bottleneck (CPU↔GPU)",
        "NVLink: 600-900 GB/s GPU↔GPU (vs PCIe ~64 GB/s). Critical for multi-GPU training. NVSwitch for full connectivity",
        "Tensor cores: specialized matrix multiplication hardware. FP16/BF16/TF32/INT8 precision. Why mixed precision training is faster",
        "GPU utilization vs GPU memory utilization: nvidia-smi shows both. Training at 30% compute util = CPU bottleneck or data pipeline bottleneck",
      ],
      scenarios: [
        "ML training runs at 30% GPU utilization. 80GB VRAM, only 20GB used. What's the bottleneck? How do you find it? (CPU data preprocessing can't feed GPU fast enough. Profile CPU during training, check data loader num_workers, check PCIe bandwidth with nvidia-smi)",
        "K8s pod has CPU limit '2'. App uses 2.5 cores for 100ms then idles for 50ms. What happens? (CPU throttling — pod can use 200ms per 100ms period, excess gets throttled. App appears slow but CPU usage looks fine. Check container_cpu_cfs_throttled_periods)",
        "You have 8xA100 GPUs in one node. Training with data parallelism. Performance scales 7.5x. Why not 8x? (Communication overhead during AllReduce gradient synchronization, even with NVLink)",
      ],
      project: { name: "Build a CPU & GPU Resource Profiler", desc: "Tool that profiles a running process or GPU workload: (1) CPU: read /proc/PID/stat for CPU time, /proc/PID/status for memory, /proc/PID/sched for context switches and wait time. (2) GPU: parse nvidia-smi output (or nvidia-smi --query-gpu) to show per-GPU: utilization, memory used/total, temperature, power draw, running processes. (3) Correlate: if GPU util is low while CPU is high → CPU bottleneck alert. If GPU memory is near limit → OOM risk alert. (4) Show NUMA topology: which CPU cores are on which socket, which GPUs are on which PCIe bus (lstopo concept)." },
      resources: ["Video: 'How a CPU Works' by Branch Education (YouTube)", "Video: 'GPU Architecture' by Branch Education", "Tool: nvidia-smi, nvtop (nvidia-smi replacement with better UI), lstopo (hwloc)"]
      },
      { week: "W18-19", title: "Python — Real Engineering, Not Tutorials (2 weeks)", concepts: [
        "Data types: int, float, str, bool, None. Mutability (list mutable, tuple/str immutable). Type conversion. Truthiness rules",
        "Data structures deep: list (dynamic array), dict (hashmap O(1) lookup), set (unique O(1) membership), tuple (immutable), deque (O(1) both ends)",
        "When to use which: list for ordered items, dict for key-value lookups, set for membership testing, tuple for fixed records",
        "List/dict comprehensions: [x for x in items if condition], {k: v for k, v in pairs}. Generator expressions with ()",
        "Functions: *args, **kwargs, default values (mutable default trap!), type hints, docstrings",
        "Error handling: try/except/else/finally. Specific exceptions (don't catch bare Exception). Custom exceptions. Context managers (with statement)",
        "File I/O: open(), read/readline/readlines, write, 'with' statement (auto-close). Binary mode. CSV (csv module), JSON (json module), YAML (pyyaml)",
        "Modules: import, from...import, __name__ == '__main__', packages, __init__.py, relative imports",
        "Standard library: os, sys, pathlib (modern path handling), subprocess (run commands), argparse (CLI), logging, datetime, collections (defaultdict, Counter, namedtuple)",
        "Classes: __init__, self, methods, properties, inheritance (keep it simple), dataclasses, __repr__/__str__",
        "Decorators: functions that wrap functions. @staticmethod, @classmethod, @property, writing custom decorators",
        "Generators and iterators: yield, lazy evaluation, why generators matter for large data (don't load 10GB into RAM)",
        "Context managers: with statement, __enter__/__exit__, contextlib.contextmanager. Used everywhere in production Python",
        "Virtual environments: venv, pip, pip freeze, requirements.txt, pyproject.toml. Why isolation matters",
        "Type hints: basic annotations (str, int, List[str], Optional[int], Dict[str, Any]). mypy for static checking",
        "Testing with pytest: test functions, assertions, fixtures, parametrize, mocking. TDD basics",
        "Async basics: asyncio, async/await, event loop, aiohttp. Why: AI serving handles thousands of concurrent requests. Async is not threading — it's cooperative multitasking on one thread",
        "HTTP requests: requests library (sync), httpx (async). Making API calls, handling errors, timeouts (ALWAYS set timeouts)",
        "subprocess: run commands from Python. capture output, handle errors, timeout. subprocess.run vs Popen",
      ],
      scenarios: [
        "Read a directory of K8s YAML manifests, find all container images using 'latest' tag, all containers running as root, all pods without resource limits. Output a JSON report with severity levels",
        "Build a CLI tool (argparse) that connects to multiple servers (from a YAML config), runs health checks concurrently (asyncio), and reports results with color-coded output",
        "Parse a 5GB log file without loading into memory (generators), extract error patterns (regex), count by category (Counter), output top 20 with percentages",
        "Write a wrapper around subprocess that runs a command with timeout, captures stdout/stderr, handles errors, and retries with exponential backoff. Include pytest tests",
      ],
      project: { name: "Build a K8s Manifest Linter + Resource Calculator", desc: "Two production-grade Python tools: (1) Linter: reads K8s YAML files, checks 15+ rules (no latest tag, no root containers, resource limits set, probes defined, no hostNetwork/hostPID, no privileged mode, proper labels, etc). Severity levels. JSON and table output. pytest test suite with at least 20 test cases. (2) Resource Calculator: reads all manifests in a directory, sums up CPU/memory requests and limits per namespace, shows utilization vs cluster capacity (input as flags), warns on overcommit. Both tools: proper argparse CLI, logging, error handling, type hints." },
      resources: ["Book: 'Automate the Boring Stuff' (free online) — fast-track Python basics in week 1", "Book: 'Fluent Python' — reference for deeper concepts (skim relevant chapters, don't read cover-to-cover)", "Practice: exercism.io Python track — 20 problems. Write tests for each. No AI assistance."]
      },
      { week: "W20", title: "Go — Reading Level for Cloud-Native", concepts: [
        "Why Go: K8s, Docker, containerd, Terraform, Prometheus, etcd, Helm — ALL written in Go. You must read Go code",
        "Go basics: packages, imports, main function, variables (:= short declaration), types (int, string, bool, []byte)",
        "Functions: multiple return values (value, error pattern), named returns, variadic functions",
        "Error handling: Go has no exceptions. Every function returns (result, error). 'if err != nil' pattern",
        "Structs: Go's 'objects'. Fields, methods (func (s *Struct) Method()), pointer receivers vs value receivers",
        "Interfaces: implicit implementation (no 'implements' keyword). Duck typing. io.Reader, io.Writer, error interface",
        "Goroutines: lightweight threads. 'go functionName()'. Channels: communication between goroutines. 'ch <- value' send, '<-ch' receive",
        "Packages and modules: go.mod, import paths, public (Capitalized) vs private (lowercase) names",
        "Slices and maps: Go's arrays and hashmaps. make(), append(), range iteration",
        "Reading K8s source: understand controller-runtime pattern, reconcile loop, client-go informers (conceptually)",
        "Building simple Go programs: HTTP server, CLI tool with cobra/pflag (like kubectl)",
      ],
      scenarios: [
        "Read the K8s kubelet source code for container creation. Identify where it calls CRI (container runtime interface) to create a container. Understand the flow even if you can't write it",
        "Read a simple K8s controller (like a CronJob controller) and explain: what it watches, what triggers reconciliation, what it does on each reconcile",
        "A Terraform provider has a bug. Read the Go source code of the provider to identify where the bug might be. File an issue with specific line references",
      ],
      project: { name: "Build a Simple HTTP Health Checker in Go + Read K8s Controller Source", desc: "Two parts: (1) Write a Go program that takes a list of URLs from a YAML config, checks each periodically (using goroutines for concurrency), reports status, and exposes a /health endpoint summarizing all checks. This teaches Go basics with real utility. (2) Clone the K8s repository. Navigate to pkg/kubelet. Read and annotate (in comments) how kubelet creates a container — trace from receiving a Pod spec to calling CRI. Write a document explaining the flow in your own words. Reading > writing for Go at this stage." },
      resources: ["Book: 'The Go Programming Language' by Donovan & Kernighan — Ch 1-8", "Tour of Go: tour.golang.org — complete the basics (free, interactive)", "Source: github.com/kubernetes/kubernetes — navigate and read, don't be intimidated"]
      },
      { week: "W21-22", title: "Containers from Scratch + GPU Containers (2 weeks)", concepts: [
        "What a container IS: process + namespaces + cgroups + filesystem. Not a VM. No separate kernel",
        "Namespaces: PID (own process tree), NET (own network), MNT (own filesystem view), UTS (own hostname), IPC (own IPC), USER (own uid mapping)",
        "Creating namespaces: unshare (create new), nsenter (enter existing), clone() syscall with namespace flags",
        "Cgroups v2: /sys/fs/cgroup. cpu.max (CPU limit), memory.max (memory limit), memory.current, pids.max, io.max",
        "chroot vs pivot_root: changing root filesystem. pivot_root is more secure (old root can be unmounted)",
        "OverlayFS: layers — lowerdir (read-only image) + upperdir (container writes) + merged (combined view). This IS how container images work",
        "OCI image spec: manifest (metadata), config (env, cmd, entrypoint), layers (tarballs of filesystem changes). An image is just tarballs + JSON",
        "Container runtime chain: kubelet → CRI (gRPC) → containerd → runc → clone() with namespaces + cgroups → your process",
        "runc: the low-level runtime. Reads OCI runtime spec (config.json), creates namespaces, sets cgroups, pivot_roots, exec's the process",
        "PID 1 problem in containers: no default signal handling, no zombie reaping. Tini/dumb-init: lightweight init that handles signals and reaps zombies",
        "Image optimization: multi-stage builds, distroless/scratch images, layer ordering (least-changing first), .dockerignore, minimizing layers",
        "GPU in containers: NVIDIA Container Toolkit (nvidia-container-toolkit), nvidia-container-runtime (replaces runc), CDI (Container Device Interface)",
        "GPU container mechanics: NVIDIA runtime mounts GPU devices (/dev/nvidia*), NVIDIA driver libraries, CUDA libraries into the container at runtime. Container image doesn't need CUDA installed if runtime injects it",
        "MIG (Multi-Instance GPU): split one A100 into up to 7 independent GPU instances. Each gets isolated memory and compute. For AI inference serving: pack multiple models on one GPU",
        "GPU time-slicing: share a GPU between containers by time-slicing. Less isolation than MIG but works on all GPUs. K8s NVIDIA device plugin supports both",
        "Container security: rootless containers, user namespaces, seccomp profiles (whitelist syscalls), AppArmor/SELinux, read-only rootfs, no-new-privileges, dropping capabilities",
        "Container logging: stdout/stderr convention. Container runtime captures stdout/stderr. In K8s: kubelet reads from container log file. Structured logging (JSON) vs unstructured",
        "Container storage: bind mounts (host path into container), volumes (managed by runtime), tmpfs (RAM-based), CSI (Container Storage Interface) for K8s",
      ],
      scenarios: [
        "A GPU container shows 'CUDA error: no device found' but nvidia-smi works on the host. Debug step by step (Check: nvidia-container-runtime configured in containerd/docker, --gpus flag or device plugin, check /dev/nvidia* inside container, check driver compatibility)",
        "Container image is 15GB (ML framework + model). Pull takes 5 minutes. Optimize to under 3GB. (Multi-stage build: build in fat image, copy only runtime + model to slim image. Use specific CUDA runtime base, not devel. Don't include training code in serving image)",
        "Container runs fine with docker but crashes in K8s with OOM at 1GB limit. Docker had no limit. The app uses 1.2GB. But actually only 500MB is heap — where's the other 700MB? (mmap'd model files, shared libraries, thread stacks. Check /proc/PID/smaps inside the container via kubectl debug)",
        "You need 3 different AI models on one A100 GPU, each isolated. Options? (MIG: split GPU into 3 instances, true isolation. Time-slicing: share GPU, less isolation. MPS: CUDA Multi-Process Service, concurrent execution but shared memory)",
      ],
      project: { name: "THE BIG ONE: Build a Container Runtime from Scratch + GPU Support", desc: "Week 1: Build a container runtime using ONLY Linux primitives: (1) Download alpine minirootfs. (2) unshare for PID+NET+MNT+UTS namespaces. (3) Set up OverlayFS (lowerdir=alpine rootfs, upperdir=writable layer). (4) pivot_root to new root. (5) Mount /proc inside. (6) Set up networking: veth pair, connect to host bridge, assign IP. (7) Create cgroup: set memory limit (128MB), CPU limit (50%), pids limit (100). (8) Run a process inside — verify isolation: own PID 1, own hostname, own network, resource-limited. (9) Implement graceful shutdown: trap SIGTERM, forward to container PID 1, wait, force kill after timeout. Week 2: GPU extension: (10) Research how nvidia-container-runtime works. Mount /dev/nvidia0, /dev/nvidiactl, /dev/nvidia-uvm into your container namespace. Mount NVIDIA driver .so files from host. Run nvidia-smi inside your container. You just built Docker + NVIDIA container runtime. From scratch." },
      resources: ["Talk: 'Containers From Scratch' by Liz Rice (YouTube) — watch then build without following along", "Book: 'Container Security' by Liz Rice — Ch 1-6", "Docs: NVIDIA Container Toolkit architecture documentation"]
      },
      { week: "W23", title: "Distributed Systems Fundamentals", concepts: [
        "Why distributed: single machine has limits. Scale out. Fault tolerance. Geographic distribution",
        "CAP theorem: Consistency + Availability + Partition tolerance — pick 2. Since partitions always happen: choose CP (consistent, may be unavailable) or AP (available, may be inconsistent)",
        "Raft consensus: leader election, log replication, safety. How etcd works (K8s brain). Leader accepts writes, replicates to followers, commits when majority acknowledges",
        "Quorum: majority agreement. 3 nodes: need 2 (tolerates 1 failure). 5 nodes: need 3 (tolerates 2). Always odd numbers",
        "Replication: sync (strong consistency, slower) vs async (fast, may lose data). semi-sync (at least one replica confirms)",
        "Eventual consistency: all replicas converge eventually. Fine for: caches, analytics, non-critical data. Bad for: financial transactions, inventory counts",
        "Idempotency: same operation twice = same result. Critical for retries. Example: 'set balance to 100' is idempotent, 'add 10 to balance' is NOT",
        "Message queues: Kafka (log-based, persistent, ordered), RabbitMQ (traditional broker, flexible routing), NATS (lightweight, fast). At-least-once vs exactly-once delivery",
        "Backpressure: when producer is faster than consumer. Without backpressure: queues grow until OOM. With: producer slows down",
        "Circuit breaker: stop calling a failing service. States: closed (normal) → open (failing, don't call) → half-open (test occasionally). Prevents cascade failures",
        "Observability: metrics (Prometheus — what's happening NOW), logs (Loki/ELK — what happened), traces (Jaeger/Tempo — path of a request across services)",
        "SLI/SLO/SLA: SLI = metric (latency p99), SLO = target (p99 < 200ms), SLA = contract with consequences",
        "RED method for services: Rate (requests/sec), Errors (error rate), Duration (latency). USE method for resources: Utilization, Saturation, Errors",
      ],
      scenarios: [
        "3-node etcd cluster. 1 node dies: K8s works (2/3 quorum). 2 die: K8s read-only (1/3, no quorum for writes). All 3 die: K8s is frozen (no etcd = no state)",
        "ML pipeline processes messages from Kafka. Consumer crashes mid-processing. On restart: reprocesses the message (at-least-once). Is this a problem? (Only if processing isn't idempotent. If writing to DB with unique constraint or using idempotency key: fine. If incrementing counter: will double-count)",
        "Model serving endpoint SLO: p99 latency < 200ms. Current p99 is 180ms. One slow model version pushes p99 to 300ms. What do you do? (Canary: roll back. Investigate slow model. Check: model size, memory, batch size, hardware. Don't violate SLO — it's a contract)",
      ],
      project: { name: "Build a Distributed Key-Value Store with Consensus", desc: "3 Python processes (simulating 3 servers) communicating via HTTP: (1) Leader election: one process accepts writes, others forward writes to leader. Detect leader failure (timeout), elect new leader. (2) Replication: leader sends PUT/DELETE to followers before confirming to client. Require majority acknowledgment. (3) Operations: PUT key value, GET key, DELETE key, LIST keys. (4) Failure handling: kill a follower — store continues working. Kill the leader — remaining nodes elect new leader (with brief unavailability). (5) Consistency: after a PUT is confirmed, all subsequent GETs return the new value (read-after-write). This is a simplified etcd/Raft. You'll understand why K8s depends on etcd and what happens when etcd has problems." },
      resources: ["Interactive: thesecretlivesofdata.com/raft/ — visualize Raft consensus", "Book: 'Designing Data-Intensive Applications' by Martin Kleppmann — Ch 5, 7, 8, 9 (THE distributed systems book)", "Paper: Raft paper first 8 pages — readable, well-written"]
      },
      { week: "W24", title: "Databases, Caching, Object Storage & API Design", concepts: [
        "PostgreSQL basics: tables, indexes (B-tree), queries, EXPLAIN ANALYZE (query planning), connection pooling (PgBouncer), replication (streaming)",
        "Why indexes matter: without index = full table scan O(n). With B-tree index = O(log n). Composite indexes, partial indexes",
        "Connection pooling: databases have connection limits (default ~100). 50 microservices × 10 connections = 500. Pooler shares connections",
        "Database replication: primary-replica. Primary handles writes, replicas handle reads. Replication lag = stale reads",
        "Redis: in-memory key-value store. Use cases: caching, session store, rate limiting, pub/sub, leaderboards. Single-threaded but incredibly fast",
        "Cache patterns: cache-aside (app checks cache, misses go to DB), write-through (write to cache+DB), write-behind (write to cache, async to DB)",
        "Cache invalidation: TTL (simplest), event-based (DB change triggers cache delete), versioning. 'The two hardest problems in CS: cache invalidation and naming things'",
        "Object storage: S3/GCS/MinIO. Flat namespace (no directories, just key prefixes). Eventually consistent (for overwrites). Cheap, durable, scalable. THE storage for ML: training data, model artifacts, checkpoints, datasets",
        "Presigned URLs: temporary access to S3 objects without sharing credentials. Used for: model download, dataset upload",
        "API design: REST conventions, proper status codes, pagination (cursor-based > offset), versioning (/v1/), rate limiting (token bucket), idempotency keys",
        "API authentication: API keys (simple), JWT (stateless, contains claims), OAuth 2.0 (delegated auth), mTLS (service-to-service)",
        "Cost awareness: cloud compute pricing (on-demand vs reserved vs spot), GPU instance costs ($3-30/hr), storage costs (S3: $0.023/GB/mo, SSD: $0.10/GB/mo), data transfer costs. Cost optimization is a Platform Engineer's responsibility",
        "Multi-tenancy: resource quotas, namespace isolation, network policies, fair-share scheduling. Platform Engineering IS multi-tenancy. Multiple teams sharing infrastructure safely",
      ],
      scenarios: [
        "ML platform has 20 teams each running experiments. One team launches 100 GPU jobs and starves everyone else. Design the multi-tenancy: namespace per team, ResourceQuota per namespace, PriorityClass for different job types, LimitRange for per-pod defaults",
        "Model registry API: 50 teams, 500 models, 10,000 versions. Design the API: endpoints, pagination (cursor-based for consistency), versioning, auth (team-scoped), rate limiting",
        "Training data in S3: 10TB dataset, 8 GPU nodes need to read it simultaneously. How do you prevent S3 throttling? (Shard data across multiple prefixes, use S3 Transfer Acceleration or local caching layer like Alluxio, read in parallel with different key ranges)",
        "Your cloud bill is ₹15 lakh/month. 60% is GPU instances running 24/7 but utilization shows 30% average. How do you cut the bill in half? (Spot instances for fault-tolerant training, auto-scaling based on queue depth, right-sizing instances, scheduling jobs during off-peak, preemptible instances with checkpointing)",
      ],
      project: { name: "Build an ML Model Registry API", desc: "A complete REST API (Python FastAPI or Flask): (1) Models: CRUD for model metadata (name, description, owner, framework). (2) Versions: upload model artifact (store in local filesystem simulating S3), download with presigned-like token. (3) Deployment: mark a version as 'production' — only one version per model can be production. (4) Auth: API keys per team, team can only modify their models. (5) Rate limiting: 100 requests/min per team. (6) Caching: Redis for frequently accessed model metadata. (7) Database: PostgreSQL (or SQLite for simplicity) with proper schema, indexes, migrations. (8) Tests: pytest suite covering all endpoints and edge cases. This is a simplified version of MLflow Model Registry / Weights & Biases." },
      resources: ["Book: 'DDIA' by Kleppmann — Ch 3 (Storage), Ch 5 (Replication), Ch 6 (Partitioning)", "FastAPI tutorial: fastapi.tiangolo.com — excellent docs, learn by building", "AWS S3 documentation: understand the API, pricing model, performance characteristics"]
      },
    ]
  },
  {
    id: "p4", title: "PHASE 4: Git, Observability & Capstone PaaS", duration: "Weeks 25–28", color: "#10B981", icon: "🏆",
    hours: "~45 hrs", summary: "4 weeks. Git internals, observability deep, then the capstone that combines everything into a mini PaaS.",
    weeks: [
      { week: "W25", title: "Git Internals & Observability Deep", concepts: [
        "Git objects: blob (file content), tree (directory listing), commit (tree + parent + metadata), tag (named pointer to commit)",
        "How 'git commit' works: hash content → create blobs → create tree → create commit pointing to tree + parent commit → update branch ref",
        "Branches: just a file in .git/refs/heads/ containing a commit hash. Creating a branch = creating a 40-byte file. Branching is instant",
        "Merge vs rebase: merge creates merge commit (preserves history), rebase replays commits (linear history). Trade-offs in team workflows",
        "Reflog: git's safety net. Records every HEAD movement. Recover from force-push disasters, accidental resets, dropped commits",
        "GitOps: Git as single source of truth for infrastructure. Reconciliation loop: git state → desired state → controller makes actual state match",
        "Prometheus: pull-based metrics collection. Time series database. PromQL for querying. Exporters for different systems. Alertmanager for alerts",
        "Grafana: dashboards for Prometheus metrics. Dashboard-as-code with JSON/YAML",
        "Logging pipeline: app → stdout/stderr → container runtime → kubelet → log aggregator (Loki/ELK) → query/dashboard",
        "Distributed tracing: trace ID propagated across services. Each service adds spans. See the full path of a request and time per hop. OpenTelemetry standard. Jaeger/Tempo for storage",
        "The 3 pillars: metrics (aggregated, what's happening), logs (detailed, what happened), traces (request-scoped, how it happened). All three needed for production debugging",
        "Alerting: alert on symptoms not causes. Page on SLO breach, not CPU usage. Runbooks for each alert",
      ],
      scenarios: [
        "Force-pushed to main and lost 3 days of team commits. Recover everything. (git reflog → find commit before force-push → git reset or cherry-pick)",
        "Model serving p99 latency spiked from 100ms to 2s. Walk through debugging: check metrics (which endpoint, when did it start), check traces (is one downstream call slow), check logs (any errors around that time). Systematic, not random",
        "You have 50 microservices. One request fails. How do you find which service caused it? (Distributed tracing: look up trace ID from the error response, see the full span tree, identify the failing span with error tags and timing)",
      ],
      project: { name: "Build a Git Implementation + Monitoring Stack", desc: "Two projects: (1) Git from scratch in Python: init (create .mygit/objects and refs), hash-object (SHA1 hash, store blob), cat-file (read object), write-tree (create tree from staged files), commit-tree (create commit), update-ref (move branch pointer), log (walk commit history). Understand: Git is a content-addressable filesystem + DAG. (2) Monitoring stack: set up Prometheus (scrape your health check tools from previous projects), create Grafana dashboards (CPU, memory, network, custom app metrics), set up alerting rules (e.g., alert if health check fails). Even on a single VM — the concepts transfer directly to K8s." },
      resources: ["Book: 'Pro Git' (free) — Ch 10 Git Internals", "Blog: 'Write yourself a Git' by Thibault Polge", "Lab: Install Prometheus + Grafana on your VM. Scrape node_exporter. Build dashboards."]
      },
      { week: "W26-27", title: "Scheduling, Developer Experience & Security Capstone (2 weeks)", concepts: [
        "Scheduling theory: bin-packing (fit pods into nodes efficiently), preemption (evict low-priority for high-priority), affinity/anti-affinity (co-locate or spread pods)",
        "Gang scheduling: all resources for a job must be allocated together or not at all. Critical for distributed training (all 8 GPUs needed simultaneously)",
        "Fair-share scheduling: divide resources fairly between teams/projects. Priority classes, resource quotas, limit ranges",
        "Developer experience: the Platform Engineer's product is the platform itself. Internal Developer Platforms (IDP), self-service portals, golden paths (recommended ways to do things)",
        "Platform APIs: instead of 'file a ticket to deploy,' developers call an API or use a CLI. Abstractions that hide K8s complexity",
        "Supply chain security: image scanning (Trivy), SBOMs (Software Bill of Materials), signed images (cosign/Notary), admission controllers (block unscanned/unsigned images)",
        "Secret management: HashiCorp Vault, AWS Secrets Manager. Never in Git, never in env vars in plain text. Dynamic secrets, rotation, audit logging",
        "Zero trust: never trust, always verify. mTLS everywhere, least privilege, network policies, workload identity",
        "Compliance: SOC 2, HIPAA (healthcare), PCI DSS (payments). Platform Engineers build the guardrails that make compliance possible",
      ],
      scenarios: [
        "Team A needs 64 GPUs for a training job. Cluster has 80 GPUs but 40 are in use by Team B (low-priority inference). What happens? Design the scheduling policy. (PriorityClass: training > inference. Preemption: evict low-priority inference pods. Gang scheduling: all 64 allocated together. Fair-share: Team A quota allows 64, Team B gets remaining)",
        "10 teams use your platform. Each complains the other teams are using too many resources. Design multi-tenancy: namespaces, quotas, limit ranges, priority classes, network isolation, monitoring per team",
        "A developer accidentally committed AWS keys to a public repo 2 months ago. The damage? (Keys likely compromised, check CloudTrail for unauthorized usage, rotate ALL keys, scan for any created resources, enable git-secrets/pre-commit hooks to prevent recurrence)",
      ],
      project: { name: "Security + Platform Design Capstone", desc: "Two projects: (1) Build a complete image security pipeline in Bash/Python: scan images with Trivy, generate SBOM, check for critical CVEs, output pass/fail report. Simulate an admission controller: script that reads a K8s manifest, checks if the image has been scanned and approved, blocks deployment if not. (2) Design document (markdown, well-structured): design an ML platform for 5 teams sharing a 10-node GPU cluster. Cover: namespace design, resource quotas per team, scheduling policies (training vs inference priority), network policies (team isolation), secret management, CI/CD pipeline, monitoring per team, self-service API for deploying models. This is a Staff-level design exercise." },
      resources: ["Tool: trivy — scan container images for vulnerabilities (free, easy to install)", "Read: CNCF platforms whitepaper — understanding internal developer platforms", "Design: Write the platform design document as if presenting to your VP of Engineering"]
      },
      { week: "W28", title: "MEGA CAPSTONE: Build a Mini PaaS (Your Own Tiny Heroku)", concepts: [
        "This project combines EVERYTHING from 27 weeks",
      ],
      scenarios: [
        "A deployed app crashes. Debug through your full stack: process, container isolation, networking, resource limits, logs",
        "Two apps need to communicate. Verify network routing through your bridge, iptables, and DNS",
        "An app exceeds memory limit. Verify cgroups enforcement. Check OOM events in dmesg",
        "Deploy a second instance of an app and verify your load balancer distributes traffic between both",
      ],
      project: { name: "Mini PaaS: Your Own Heroku from Linux Primitives", desc: "Build a platform that accepts apps and runs them in isolated environments: (1) CONTAINER RUNTIME: namespaces + cgroups + OverlayFS for isolation with resource limits. (2) NETWORKING: per-container network namespace, bridge, DNAT for external access, inter-container DNS. (3) PROCESS SUPERVISOR: monitor apps, restart on crash, graceful shutdown, PID 1 handling. (4) DEPLOYMENT: takes a git repo URL, clones, builds rootfs with dependencies, deploys to runtime. (5) HEALTH CHECKS: periodic HTTP checks, mark unhealthy, auto-restart. (6) LOAD BALANCER: if 2 instances, round-robin traffic. (7) MONITORING: CPU/memory/network per container from /proc and cgroups, Prometheus-compatible metrics endpoint. (8) SECURITY: non-root, minimal capabilities, network isolation between apps. (9) CLI: 'mypaas deploy app-name --repo URL --memory 256m --cpu 50%', 'mypaas status', 'mypaas logs app-name', 'mypaas scale app-name --replicas 3'. This IS Kubernetes, simplified. Built by you. When you later learn K8s, every concept will click instantly because you already built the primitive version." },
      resources: ["No tutorial needed — you ARE the expert now. Use everything from 27 weeks.", "Reference: Look at dokku (mini-Heroku) architecture — but build yours from scratch, not their code", "After this: You're ready for K8s, Terraform, AI Infra. The foundation is unshakable."]
      },
    ]
  },
  {
    id: "p5", title: "PHASE 5: AI Infrastructure Fundamentals", duration: "Weeks 29–32", color: "#EC4899", icon: "🧠",
    hours: "~45 hrs", summary: "4 weeks. GPU orchestration, model serving, distributed training, ML data formats. The bridge to your AI Infra career.",
    weeks: [
      { week: "W29", title: "GPU Deep — CUDA, Memory, Profiling & Orchestration", concepts: [
        "CUDA programming model: threads → blocks → grid. Each thread runs the same kernel on different data (SIMT)",
        "CUDA toolkit: nvcc compiler, CUDA runtime API, CUDA driver API. Toolkit vs driver version compatibility matrix",
        "GPU memory management: cudaMalloc/cudaFree (explicit), unified memory (cudaMallocManaged — auto-migrates between CPU/GPU), pinned memory (cudaMallocHost — faster CPU→GPU transfer)",
        "VRAM fragmentation: memory allocations leave gaps. Large model may fail even with 'enough' total VRAM. nvidia-smi shows total free but not largest contiguous block",
        "Memory profiling: nvidia-smi (basic), nvtop (interactive), torch.cuda.memory_stats() (PyTorch), CUDA Memory Checker",
        "GPU profiling: Nsight Systems (system-wide), Nsight Compute (kernel-level), nvprof (deprecated but still seen), PyTorch Profiler",
        "When model doesn't fit in VRAM: (1) Quantization: FP32→FP16→INT8→INT4, reduces memory 2-8x with some accuracy loss. (2) Model parallelism: split model across GPUs. (3) Offloading: keep some layers in CPU RAM, move to GPU as needed. (4) Gradient checkpointing: recompute instead of storing activations, saves memory for training",
        "MIG (Multi-Instance GPU): A100/H100 can be partitioned into up to 7 isolated GPU instances. Each has guaranteed compute and memory. Perfect for inference: pack multiple models on one GPU",
        "MPS (Multi-Process Service): share one GPU between multiple processes with concurrent kernel execution. Less isolation than MIG",
        "GPU time-slicing: K8s NVIDIA device plugin feature. Multiple pods share one GPU by time-slicing. No memory isolation — simplest but riskiest",
        "NVIDIA device plugin for K8s: makes GPUs schedulable resources (nvidia.com/gpu). Handles device mounting, health checking",
        "CUDA driver vs runtime compatibility: driver is on the host (kernel module), runtime is in the container (CUDA toolkit). Container CUDA version must be ≤ host driver supported version",
        "GPU topology: nvidia-smi topo -m shows NVLink/PCIe connections between GPUs. Optimal placement for multi-GPU training depends on topology",
      ],
      scenarios: [
        "Training crashes with CUDA OOM but nvidia-smi shows 20GB free on the GPU. Why? (Memory fragmentation — 20GB total free but not contiguous. Or: the framework reserved memory pool is full. Fix: torch.cuda.empty_cache(), reduce batch size, or use gradient checkpointing)",
        "You have 4 A100 GPUs. nvidia-smi topo shows GPUs 0-1 connected via NVLink, GPUs 2-3 via NVLink, but 0-2 only via PCIe. Optimal data parallel training? (Use GPUs 0-1 or 2-3 for 2-GPU jobs. For 4-GPU: hierarchical AllReduce — fast reduce within NVLink pairs, then slower reduce across PCIe)",
        "K8s pod requests 1 GPU. It starts, loads a model, but inference is very slow compared to running directly on the host. Why? (Check: is it time-sliced and contending with another pod? Is it getting a MIG slice instead of full GPU? Is CPU data preprocessing the bottleneck? Is PCIe the bottleneck for data transfer?)",
        "Three teams need inference serving on 2 A100 GPUs. Team A: LLM needing 40GB VRAM. Team B: vision model 5GB. Team C: small text model 2GB. How do you allocate? (Team A: full GPU 1. Teams B+C: MIG on GPU 2 — create 3g.20gb for Team B and 1g.5gb for Team C)",
      ],
      project: { name: "Build a GPU Monitoring and Allocation Dashboard", desc: "A comprehensive GPU management tool: (1) GPU inventory: list all GPUs, their topology (NVLink/PCIe connections), MIG capability, current MIG partitions. (2) Real-time monitoring: per-GPU utilization, memory used/free, temperature, power, running processes with memory usage. (3) MIG management: script to create/destroy MIG instances, show current partition layout. (4) Allocation simulator: given a list of workloads with VRAM requirements, suggest optimal GPU allocation (which workload on which GPU, whether to use MIG). (5) Alert on: GPU utilization < 20% for > 30min (underutilized), memory > 90% (OOM risk), temperature > 80°C." },
      resources: ["NVIDIA CUDA Programming Guide — first 5 chapters (concepts, not coding)", "nvidia-smi manual: 'nvidia-smi --help-query-gpu' — explore every metric available", "Lab: If you have GPU access (cloud free tier, Colab, or Lambda Labs $0.50/hr) — run nvidia-smi, nvtop, profile a PyTorch model"]
      },
      { week: "W30", title: "Model Serving, Data Formats & ML Pipelines", concepts: [
        "Batch inference vs real-time inference: batch = process dataset offline (Spark, batch job), real-time = serve predictions via API (latency-sensitive). Different infrastructure needs",
        "Model serving frameworks: NVIDIA Triton (multi-framework, high performance), TorchServe (PyTorch native), TF Serving (TensorFlow), vLLM (LLM optimized), Ollama (local LLMs)",
        "Model serving challenges: model loading time (large models take minutes to load — need warm-up), memory management (model weights in VRAM), batching (group multiple inference requests for GPU efficiency)",
        "Dynamic batching: collect multiple requests, process as one GPU batch. Higher throughput but adds latency. Trade-off: batch timeout vs batch size",
        "Model versioning: v1, v2 running simultaneously. A/B testing (route % of traffic to new version), canary (slowly increase new version traffic), shadow (send traffic to both, compare results, serve only from primary)",
        "Continuous batching for LLMs: different from static batching. New requests can join an in-progress batch as earlier requests finish. vLLM's key innovation. Dramatically improves throughput",
        "KV cache: key-value cache for transformer attention. Grows with sequence length. Major VRAM consumer for LLM serving. PagedAttention (vLLM) manages KV cache like OS virtual memory",
        "ML data formats: CSV (simple, slow, no types), Parquet (columnar, compressed, typed, fast for analytics), Arrow (in-memory columnar, zero-copy between processes), TFRecord (TensorFlow), HDF5 (scientific), Safetensors (model weights, safe loading)",
        "Why Parquet: columnar = read only columns you need (fast for analytics). Predicate pushdown = filter without reading full file. Compressed = smaller. Typed = no type guessing",
        "Feature stores: precomputed feature values stored for fast retrieval during inference. Feast, Tecton. Online store (Redis, low-latency) + offline store (S3/Parquet, batch processing)",
        "ML pipeline orchestration: Kubeflow Pipelines, Airflow, Argo Workflows, Prefect. DAG of steps: data prep → training → evaluation → deployment",
        "Experiment tracking: MLflow, Weights & Biases, Neptune. Track: hyperparameters, metrics, artifacts, code version, data version. Reproducibility is the goal",
        "Model registry: store trained model artifacts with metadata, versioning, deployment status, lineage. MLflow Model Registry pattern",
      ],
      scenarios: [
        "LLM serving endpoint: 100 concurrent users, average input 500 tokens, output 200 tokens, p99 target 5s. Size the infrastructure: which GPU, how much VRAM for KV cache, batch size, how many replicas. (Estimate: model weights + KV cache for 100 concurrent sequences. H100 80GB might handle it. Use continuous batching with vLLM. Monitor VRAM and latency, auto-scale on queue depth)",
        "Training data is 5TB of images in PNG format on S3. Training reads each image, resizes, normalizes. It's slow — GPU is idle 70% of the time. Fix the data pipeline. (Convert to TFRecord/WebDataset format — sequential reads, no small file overhead. Use multiprocess data loading. Prefetch next batch while GPU processes current. Cache in local NVMe if possible)",
        "Two model versions: v1 (small, fast, less accurate) and v2 (large, slow, more accurate). Design the serving strategy for gradual v2 rollout. (Shadow mode: send all traffic to both, compare accuracy, serve v1 results. Then canary: 5% → 25% → 50% → 100% to v2 if metrics look good. Auto-rollback if error rate increases)",
      ],
      project: { name: "Build an ML Model Serving Platform (Simplified Triton)", desc: "A Python-based model serving system: (1) Model loading: load PyTorch/ONNX models from a directory (model registry), support multiple versions. (2) HTTP API: /predict endpoint, accept JSON input, return prediction. /models endpoint listing loaded models and versions. (3) Dynamic batching: collect requests over 50ms window, batch them, infer together, return individual results. Measure improvement in throughput vs no-batching. (4) Model versioning: /predict?model=resnet&version=2, support 'latest' alias. (5) Health: /health endpoint, model warm-up on startup, readiness vs liveness. (6) Metrics: request count, latency histogram (p50/p95/p99), error rate, model inference time, queue depth. You don't need a GPU — use CPU inference for small models (ONNX Runtime). The architecture patterns are identical." },
      resources: ["Docs: vLLM documentation — understand PagedAttention and continuous batching concepts", "Docs: NVIDIA Triton Inference Server architecture documentation", "Book: 'Designing Machine Learning Systems' by Chip Huyen — Ch 7 (Model Deployment), Ch 9 (Continual Learning)"]
      },
      { week: "W31", title: "Distributed Training & GPU Networking", concepts: [
        "Why distributed training: single GPU can't fit large models or process data fast enough. Scale to multiple GPUs/nodes",
        "Data parallelism: same model on each GPU, different data batches. AllReduce to synchronize gradients. Most common, simplest",
        "Model parallelism: split model layers across GPUs. Pipeline parallelism: split model into stages, each on different GPU, micro-batches flow through pipeline",
        "Tensor parallelism: split individual layers (matrices) across GPUs. Each GPU computes part of a layer. Requires very fast interconnect (NVLink)",
        "3D parallelism: combine data + pipeline + tensor parallelism. Used for training largest models (GPT-4 class)",
        "AllReduce operation: every GPU sends its gradients, receives the sum of all gradients. Ring AllReduce: efficient O(n) algorithm, bandwidth-optimal",
        "NCCL: NVIDIA Collective Communication Library. Handles AllReduce and other collective operations. Auto-selects best transport: NVLink (intra-node), RDMA/InfiniBand (inter-node), TCP (fallback)",
        "NCCL topology detection: reads GPU topology (NVLink, PCIe), creates optimal communication pattern. NCCL_DEBUG=INFO shows chosen paths",
        "InfiniBand: high-speed network for HPC/AI clusters. 100-400 Gbps. RDMA native. Used in every serious training cluster",
        "RoCE v2: RDMA over Converged Ethernet. Run on regular Ethernet NICs with RDMA support. Needs lossless config (PFC, ECN). Cheaper than InfiniBand",
        "Network bottleneck in distributed training: gradient synchronization. Gradient compression, overlap communication with computation, reduce frequency of sync",
        "DeepSpeed: Microsoft library for efficient distributed training. ZeRO optimizer (shard optimizer state, gradients, parameters across GPUs — reduces memory per GPU)",
        "FSDP (Fully Sharded Data Parallel): PyTorch native version of ZeRO. Shard model parameters across GPUs, gather on demand for forward/backward pass",
        "Checkpointing: save model state periodically so training can resume after failure. For large models: distributed checkpointing, async checkpointing to not block training",
        "Elastic training: add/remove nodes during training without restarting. Torch Elastic (torchelastic). Useful with spot/preemptible instances",
      ],
      scenarios: [
        "Training a 70B parameter model. Single H100 has 80GB VRAM. Model in FP16 = 140GB. How do you train it? (Can't fit on one GPU. Options: FSDP/DeepSpeed ZeRO-3 to shard across GPUs. 4x H100 with NVLink: shard model, each GPU holds ~35GB of parameters + activations + optimizer state. Or: pipeline parallelism with tensor parallelism within nodes)",
        "8-node cluster, each with 8 A100s (64 GPUs total). Training is 50% efficient (should be 64x faster than 1 GPU but only 32x). Diagnose. (Check NCCL logs: is it using InfiniBand or falling back to TCP? Check AllReduce time vs compute time ratio. Profile with Nsight Systems. If inter-node communication is bottleneck: increase batch size to overlap compute and communication, use gradient compression, check for stragglers)",
        "Training on spot instances. One instance gets preempted every ~2 hours. How do you make training robust? (Checkpoint every 30 min, use elastic training (torchelastic) to continue with remaining nodes, auto-replace preempted instances, use a mix of on-demand for critical workers and spot for the rest)",
      ],
      project: { name: "Build a Distributed Training Orchestrator", desc: "Design and partially implement a system for managing distributed training jobs: (1) Job spec: define a training job — model, data location, GPU count, parallelism strategy. (2) Scheduler: given available GPU nodes with topology info, select optimal placement (prefer nodes with NVLink interconnect, co-locate for tensor parallelism). (3) Launcher: script that SSHs into nodes, sets up environment variables (MASTER_ADDR, MASTER_PORT, WORLD_SIZE, RANK, LOCAL_RANK), launches torchrun on each node. (4) Monitor: poll each process, detect failures, log GPU metrics during training. (5) Checkpoint manager: trigger periodic saves, store in shared filesystem/S3, track latest checkpoint. (6) Fault recovery: detect node failure, restart training from latest checkpoint on remaining nodes. You don't need actual GPUs — mock the training with a simple PyTorch DDP program on CPU or use a cloud provider for one test run." },
      resources: ["PyTorch Distributed documentation: understand DDP, FSDP, torchrun", "DeepSpeed documentation: ZeRO stages, configuration", "Blog: 'How to Train Really Large Models on Many GPUs' by Lilian Weng"]
      },
      { week: "W32", title: "FINAL CAPSTONE: Design an AI Infrastructure Platform", concepts: [
        "Everything from 32 weeks synthesized into one platform design",
      ],
      scenarios: [
        "CEO asks: 'Why did our GPU bill increase 3x this quarter?' Answer with data: utilization metrics, cost per team, spot vs on-demand ratio, idle resources. Propose optimization plan",
        "A training job has been running for 72 hours and is about to finish. The node crashes. What happens? (Depends on checkpointing strategy. If checkpoint every hour: lose 1 hour of work, restart from checkpoint. If no checkpointing: 72 hours lost. This is why checkpointing design matters)",
        "Your platform serves 50 models. One model's latency spikes to 10s. It's consuming all GPU memory on a shared node and affecting other models. How does your platform prevent and handle this? (MIG for isolation, resource quotas, circuit breakers, auto-scaling, alerting on SLO breach)",
      ],
      project: { name: "FINAL CAPSTONE: Complete AI Platform Architecture Design + Prototype", desc: "Design document (detailed markdown, 15+ pages) + working prototype for key components: THE DESIGN: An AI platform for a company with 50 ML engineers across 5 teams, a 20-node GPU cluster (mix of A100 and H100), needing both training and inference workloads. Cover every aspect: (1) Cluster architecture: node types, GPU topology, networking (InfiniBand/RoCE), storage (NVMe local + shared NFS + S3). (2) Multi-tenancy: namespaces, quotas, priority classes, fair-share scheduling between teams. (3) Training pipeline: job submission API, scheduling (gang scheduling for multi-GPU), spot instance integration, checkpointing, experiment tracking. (4) Model serving: deployment API, auto-scaling (GPU utilization + queue depth), canary deployments, A/B testing, dynamic batching. (5) Monitoring: GPU metrics, per-team cost tracking, SLOs for inference latency, alerting. (6) Security: image scanning pipeline, secret management, network isolation, RBAC. (7) Developer experience: CLI tool, self-service portal design, golden paths for common workflows. (8) Cost optimization: spot for training, right-sizing, auto-scaling, idle detection. THE PROTOTYPE: Implement 2-3 key components as working code: the job submission API, the GPU allocation simulator, and the monitoring dashboard. This design document is what a Staff AI Platform Engineer presents to leadership. If you can write this convincingly, you can get hired for that role." },
      resources: ["Reference architectures: Google Cloud AI Platform, AWS SageMaker, Azure ML architecture docs", "Read: 'Infrastructure for AI' posts from companies like Uber, Netflix, Meta engineering blogs", "This is your portfolio piece. Put it on GitHub. Write about it on your blog. Present it at meetups."]
      },
    ]
  },
];

function App() {
  const [activePhase, setActivePhase] = useState("p1");
  const [activeWeek, setActiveWeek] = useState("W1");

  const phase = PHASES.find(p => p.id === activePhase);
  const week = phase?.weeks.find(w => w.week === activeWeek);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#07070b", color: "#e0ddd8", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "28px 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, rgba(236,72,153,0.03) 0%, transparent 100%)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#EC4899", fontWeight: 600, marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>
            COMPLETE 32-WEEK ROADMAP · 5 PHASES · HARD WAY ONLY · ZERO GAPS
          </div>
          <h1 style={{ fontSize: "clamp(18px, 3.5vw, 26px)", fontWeight: 700, margin: "0 0 6px", color: "#fff", lineHeight: 1.3 }}>
            The "Never Come Back" Roadmap — Final Edition
          </h1>
          <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.5 }}>
            Linux (9wk) → Networking (7wk) → Compute/Programming/Containers (8wk) → Observability/Capstone (4wk) → AI Infra (4wk). Every concept. Every scenario. Every hard-way project. Nothing missing.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "14px 16px 32px" }}>
        {/* Phase Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {PHASES.map(p => (
            <button key={p.id} onClick={() => { setActivePhase(p.id); setActiveWeek(p.weeks[0].week); }}
              style={{
                padding: "8px 10px", background: activePhase === p.id ? `${p.color}12` : "rgba(255,255,255,0.015)",
                border: activePhase === p.id ? `1px solid ${p.color}35` : "1px solid rgba(255,255,255,0.04)",
                borderRadius: 7, cursor: "pointer", flex: "1 1 0", minWidth: 0, textAlign: "center",
              }}>
              <div style={{ fontSize: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.duration}</div>
            </button>
          ))}
        </div>

        {/* Phase Info */}
        <div style={{ padding: "12px 16px", background: `${phase.color}06`, borderRadius: 8, border: `1px solid ${phase.color}18`, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: phase.color }}>{phase.title}</div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0" }}>{phase.hours}</div>
          <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>{phase.summary}</div>
        </div>

        {/* Week Tabs */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 14 }}>
          {phase.weeks.map(w => (
            <button key={w.week} onClick={() => setActiveWeek(w.week)} style={{
              padding: "4px 10px", background: activeWeek === w.week ? `${phase.color}18` : "rgba(255,255,255,0.02)",
              border: activeWeek === w.week ? `1px solid ${phase.color}40` : "1px solid rgba(255,255,255,0.04)",
              borderRadius: 5, cursor: "pointer", fontSize: 10, color: activeWeek === w.week ? phase.color : "#666",
              fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
            }}>
              {w.week}
            </button>
          ))}
        </div>

        {/* Week Content */}
        {week && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
              <span style={{ color: phase.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{week.week}</span> {week.title}
            </div>

            {/* Concepts */}
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: phase.color, letterSpacing: 1.5, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                CONCEPTS ({week.concepts.length})
              </div>
              {week.concepts.map((c, i) => (
                <div key={i} style={{ padding: "5px 0", borderBottom: i < week.concepts.length - 1 ? "1px solid rgba(255,255,255,0.025)" : "none", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: phase.color, fontSize: 6, marginTop: 6, flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: 12, color: "#bbb", lineHeight: 1.55 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Scenarios */}
            <div style={{ padding: "14px 16px", background: "rgba(249,115,22,0.03)", borderRadius: 8, border: "1px solid rgba(249,115,22,0.1)", marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#F97316", letterSpacing: 1.5, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                🧪 DEBUG SCENARIOS ({week.scenarios.length})
              </div>
              {week.scenarios.map((s, i) => (
                <div key={i} style={{ padding: "8px 10px", marginBottom: 5, background: "rgba(0,0,0,0.2)", borderRadius: 5, fontSize: 12, color: "#ccc", lineHeight: 1.55 }}>
                  <span style={{ color: "#F97316", fontWeight: 700, marginRight: 5 }}>S{i + 1}.</span>{s}
                </div>
              ))}
            </div>

            {/* Project */}
            <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.015) 100%)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.18)", marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#EF4444", letterSpacing: 1.5, marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>
                🔨 HARD WAY PROJECT
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 5 }}>{week.project.name}</div>
              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{week.project.desc}</div>
            </div>

            {/* Resources */}
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#888", letterSpacing: 1.5, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>📚 RESOURCES</div>
              {week.resources.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: "#999", lineHeight: 1.5, marginBottom: 3, paddingLeft: 10, borderLeft: "2px solid rgba(255,255,255,0.05)" }}>{r}</div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: "16px", background: "linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(236,72,153,0.02) 100%)", borderRadius: 10, border: "1px solid rgba(236,72,153,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#EC4899", marginBottom: 6 }}>32 weeks. ~350 hours. 32 hard-way projects. Zero gaps.</div>
          <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>
            After this, you don't just know tools — you understand systems. From kernel syscalls to GPU orchestration. From TCP packets to distributed training. That's the engineer who gets hired at ₹50-70 LPA or $200K+ remote. That's the engineer who builds platforms, not just uses them.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
