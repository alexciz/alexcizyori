/**
 * =========================================================================
 * PORTFOLIO DATA CONFIGURATION — ALEXANDER CIZ YORI
 * Mechanical Engineering @ Imperial College London
 * =========================================================================
 */

const PORTFOLIO_DATA = {
  profile: {
    name: "Alexander Ciz Yori",
    shortName: "Alex Ciz Yori",
    tagline: "Mechanical Engineering Student @ Imperial College London",
    university: "Imperial College London",
    degree: "Second Year MEng Mechanical Engineering",
    grade: "First Year Grade: Upper Second Class Honours (2:1)",
    statusBadge: "Seeking Summer 2026 / 2027 Engineering Internships",
    email: "alexander.ciz-yori25@imperial.ac.uk",
    shortEmail: "adc25@ic.ac.uk",
    location: "London, UK",
    bio: "Second-year MEng Mechanical Engineering student at Imperial College London with hands-on experience in powertrain transmission design, precision mechanisms, custom CNC-routed PCB hardware, and competitive robotics. Experienced in bringing mechanical systems from first-principles analysis and SolidWorks/Fusion modeling to manufactured physical hardware and testing.",
    highlights: [
      { label: "Degree", value: "MEng Mech Eng", sub: "Imperial College London" },
      { label: "VEX Robotics", value: "World Finalist", sub: "Dallas, TX (22 Awards)" },
      { label: "A-Levels", value: "A* A* A A", sub: "Maths, CS, Physics, FM" },
      { label: "Industry Exp.", value: "Manufacturing", sub: "Focus Displays Assistant" }
    ],
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexcizyori",
      email: "mailto:alexander.ciz-yori25@imperial.ac.uk"
    }
  },

  projects: [
    {
      id: "rebar-bender-drivetrain",
      title: "Commercial Rebar Bender 4-Stage Transmission",
      subtitle: "SPA V-Belt & 3-Stage MOD4 Spur Gear Powertrain",
      category: "mechanical",
      categoryLabel: "Mechanical & Drivetrain",
      featured: true,
      has3DCadViewer: true,
      pageUrl: "projects/rebar-bender-drivetrain.html",
      thumbnail: "assets/projects/rebar-bender-drivetrain.jpg",
      badge: "5,085 Nm Torque Output",
      summary: "Designed a 4-stage transmission featuring a flexible SPA 2-groove V-belt input stage with a tensioner, followed by three fixed spur gear stages to reduce a 5.5 kW, 2877 RPM motor input down to 10.3 RPM and 5085 Nm output torque.",
      keyMetrics: [
        { label: "Output Torque", value: "5,085 N·m" },
        { label: "Input Stage", value: "SPA 2-Groove V-Belt" },
        { label: "Spur Gearing", value: "3x MOD4 Stages" },
        { label: "Output Speed", value: "10.3 RPM (279.3:1)" }
      ],
      tags: ["SolidWorks", "Powertrain Design", "Mechanical Systems", "V-Belt Drives", "MOD4 Gears", "ISO Limits & Fits"],
      caseStudy: {
        problemStatement: "Commercial rebar bending machinery demands massive low-speed torque (>5,000 N·m) to bend high-yield steel rebars smoothly without stalling. The engineering objective was to design a rugged 4-stage reduction transmission powered by a standard 5.5 kW @ 2877 RPM induction motor, incorporating a flexible V-belt input with tensioner to absorb shock loads, followed by three fixed MOD4 spur gear stages delivering 10.3 RPM and 5085 Nm of continuous bending torque.",
        designConstraints: [
          "Input motor: 5.5 kW @ 2,877 RPM (3-phase induction).",
          "Transmission Architecture: Flexible SPA 2-groove V-belt input stage with idler tensioner + 3 fixed spur gear reduction stages.",
          "Final output performance: 10.3 RPM with 5085 Nm continuous torque rating.",
          "Standard metric gear modules (MOD 4) and SKF pillow block bearing housings.",
          "Produced fully dimensioned engineering drawings specifying ISO limits and fits and DIN keyway geometries."
        ],
        engineeringProcess: "Synthesized the gear train reduction stages across intermediate stepped transmission shafts to balance torque multiplication and gear pitch diameters. Modeled the complete mechanical assembly in SolidWorks, integrating the SPA 2-groove V-belt pulley set, tensioner idler mechanism, MOD4 spur gears, SKF pillow block bearings, and a rigid welded structural steel C-channel frame bedplate.",
        feaAnalysis: {
          software: "AGMA & ISO 6336 Gear Standards / SolidWorks Simulation",
          meshElements: "Stepped shaft bending & torsional stress analysis with localized stress concentration factors at shoulder fillets (Kt = 1.65).",
          loadCases: "Peak stall shock torque: 6,200 N·m applied to final turntable bull gear.",
          maxStress: "185 MPa shear stress on final Ø65mm EN24T output shaft (Yield Strength: 680 MPa).",
          minFOS: "3.6 Factor of Safety under maximum bending load.",
          deflection: "Torsional deflection under 0.08° across the entire shaft span."
        },
        manufacturing: {
          processes: [
            "CNC & Manual Lathe turning for stepped transmission shafts and bearing journals (ISO h6/k6 fits)",
            "End milling and keyway slotting for DIN 6885 drive keys",
            "MIG welding of structural steel C-channel base frame with post-weld machining of mounting pads",
            "Gear hobbing and induction hardening for MOD4 steel gears"
          ],
          bom: [
            { item: "Electric Induction Motor", material: "5.5 kW 4-Pole (2877 RPM)", qty: 1, unitCost: "£380.00" },
            { item: "SPA 2-Groove V-Belt & Pulley Kit", material: "Cast Iron + Synthetic Rubber", qty: 1, unitCost: "£95.00" },
            { item: "MOD 4 Spur Gear Set (3 Stages)", material: "EN24T Through-Hardened Steel", qty: 6, unitCost: "£340.00" },
            { item: "Stepped Drive Shafts", material: "AISI 4140 / EN19 Round Bar", qty: 4, unitCost: "£145.00" },
            { item: "Pillow Block Bearings", material: "SKF Heavy Duty Cast Iron Housing", qty: 8, unitCost: "£210.00" },
            { item: "Welded Base Frame", material: "Structural C-Channel Steel", qty: 1, unitCost: "£180.00" }
          ]
        },
        testingValidation: "Verified 279.3:1 reduction kinematics analytically and through motion simulations. Generated complete manufacturing routing plans and 2D workshop drawings with full geometric tolerancing.",
        lessonsLearned: "Initial single-keyway design on the final high-torque shaft had excessive bearing stress along the keyway flank. Swapped to dual 180° staggered parallel keys with increased shaft shoulder fillet radii, reducing localized peak stress by 42% and eliminating fretting risk.",
        downloads: [
          { name: "Full SolidWorks CAD Assembly (STEP)", type: "cad", url: "#cad-rebar-bender" },
          { name: "Manufacturing Routing Plan & Drawings (PDF)", type: "pdf", url: "#pdf-routing-plan" }
        ]
      }
    },
    {
      id: "smart-pet-companion-robot",
      title: "Smart Pet Companion Robot (ESP32 & X-Drive)",
      subtitle: "Mechatronics, PCB Design & Additive Manufacturing",
      category: "robotics",
      categoryLabel: "Robotics & Mechatronics",
      featured: true,
      has3DCadViewer: true,
      pageUrl: "projects/smart-pet-companion-robot.html",
      thumbnail: "assets/projects/smart-pet-companion-robot.jpg",
      badge: "Custom CNC-Routed PCB",
      summary: "Designed a modular 3D printed enclosure housing a holonomic X-drive, centrifugal treat launcher, ESP32 Wi-Fi camera with LED lighting, and a motorised feather teaser with dual microcontroller architecture.",
      keyMetrics: [
        { label: "Drivetrain", value: "Holonomic X-Drive" },
        { label: "Dual MCUs", value: "ESP32 + Arduino Pro Mini" },
        { label: "PCB Fab", value: "Custom CNC-Routed Board" },
        { label: "Mechanisms", value: "Treat Launcher & Feathers" }
      ],
      tags: ["ESP32", "Arduino", "Autodesk Fusion", "Custom PCB Design", "CNC Routing", "3D Printing", "Mechatronics"],
      caseStudy: {
        problemStatement: "Commercial pet monitoring cameras are stationary and lack interactive play capabilities. The goal was to engineer a mobile robot with live Wi-Fi video streaming, zero-radius holonomic agility, a centrifugal treat dispenser, and a motorized feather teaser.",
        designConstraints: [
          "Designed a modular 3D printed enclosure housing a holonomic X-drive, centrifugal treat launcher, ESP32 Wi-Fi camera with LED lighting, and a motorised feather teaser.",
          "Implemented a dual microcontroller architecture using serial communications to offload motor control and servo timing from the ESP32 to an Arduino Pro Mini.",
          "Integrated an ESP32 hosted web server for real time video streaming and remote control, generating control signals routed via PWM for motor drivers, and transistor switching circuits.",
          "Fabricated a custom PCB on a CNC router to house motor drivers, voltage regulators, and inter-board communications onto a single compact layout."
        ],
        engineeringProcess: "Configured the kinematics for an X-drive chassis with four 45° offset omni wheels, allowing instantaneous translation in any direction while rotating. Designed the schematic and 2-layer PCB layout for motor drivers and voltage regulation, fabricating the board in-house on a desktop CNC router. Modeled the modular chassis, camera pan bracket, motorized feather teaser, and centrifugal treat-dispensing impeller in Autodesk Fusion.",
        feaAnalysis: {
          software: "Fusion CAD & Kinematics",
          meshElements: "Dynamic velocity vector resolution for 4-wheel vector drive.",
          loadCases: "Chassis drop and treat launcher centrifugal burst stress at 2,200 RPM.",
          maxStress: "12.4 MPa on 3D printed PLA treat impeller (PLA tensile strength: 50 MPa).",
          minFOS: "4.0",
          deflection: "Negligible chassis deflection under 1.8 kg total robot weight."
        },
        manufacturing: {
          processes: [
            "FDM 3D printing of chassis shell, motor brackets, and treat hopper (PLA/PETG)",
            "Isolation milling of custom single-sided/dual-sided PCB on desktop CNC router",
            "THT soldering and firmware flashing (ESP32 Camera Server + Arduino Pro Mini motor controller)"
          ],
          bom: [
            { item: "ESP32-CAM Board", material: "OV2640 Camera Module", qty: 1, unitCost: "£7.50" },
            { item: "Arduino Pro Mini", material: "ATmega328P 5V/16MHz", qty: 1, unitCost: "£3.20" },
            { item: "N20 Geared Micro Motors", material: "6V 300 RPM Metal Gearmotors", qty: 4, unitCost: "£14.00" },
            { item: "Omni Wheels (48mm)", material: "Rubber Roller Omni Wheels", qty: 4, unitCost: "£12.00" },
            { item: "Custom CNC PCB & Drivers", material: "FR1 Board + L298N/DRV8833", qty: 1, unitCost: "£6.00" },
            { item: "LiPo Battery (2S 7.4V)", material: "1500mAh 25C LiPo", qty: 1, unitCost: "£11.00" }
          ]
        },
        testingValidation: "Tested Wi-Fi control range and streaming frame rate (25 FPS at SVGA resolution). Calibrated motor PID curves for smooth omnidirectional translation.",
        lessonsLearned: "Early single-microcontroller architecture struggled to handle video encoding while maintaining jitter-free PWM motor timing. Offloading real-time inverse kinematics to a dedicated Arduino Pro Mini while keeping the ESP32 purely for Wi-Fi and camera streaming eliminated all motor stutter.",
        downloads: [
          { name: "Full Fusion Assembly & STL Files", type: "cad", url: "#cad-pet-robot" },
          { name: "PCB Schematic & Arduino Firmware (ZIP)", type: "code", url: "#code-pet-robot" }
        ]
      }
    },
    {
      id: "vex-tipping-point",
      title: "VEX Tipping Point Robot",
      subtitle: "Mobile Goal Clamping Chassis, 4-Bar Lift & Ring Conveyor",
      category: "robotics",
      categoryLabel: "Robotics & Competition",
      featured: true,
      has3DCadViewer: false,
      pageUrl: "projects/vex-tipping-point.html",
      thumbnail: "assets/projects/vex-tipping-point.jpg?v=2",
      badge: "Inaugural Competition Season",
      summary: "Engineered a competition robot for the Tipping Point game featuring a front 4-bar linkage lift for neutral goal elevation, pneumatic rear mobile goal clamping jaws, and a high-traction urethane ring scoring conveyor.",
      keyMetrics: [
        { label: "Drivetrain", value: "4-Motor 200 RPM Direct Drive" },
        { label: "Goal Handling", value: "Pneumatic Clamp & 4-Bar Lift" },
        { label: "Rebuild Focus", value: "Nationals Pneumatic Overhaul" },
        { label: "Endgame", value: "Balanced Platform Lock" }
      ],
      tags: ["VEX Tipping Point", "Linkage Mechanics", "Mobile Goal Clamp", "Kinematics", "Pneumatics", "Robotics"],
      caseStudy: {
        problemStatement: "The Tipping Point game demanded securing heavy mobile goals from across the field and balancing them on an elevated seesaw platform alongside alliance robots while simultaneously scoring scoring rings on tall goal branches.",
        designConstraints: [
          "18-inch x 18-inch starting footprint expanding dynamically in match play.",
          "High-torque lift capable of elevating 1.5 kg neutral mobile goals onto the balanced platform.",
          "Rapid-cycle rear pneumatic clamp to retain alliance mobile goals under heavy pushing defense.",
          "High-traction ring intake with jam-clearing bi-directional reverse."
        ],
        engineeringProcess: "Early season relied on a motorized lead-screw clamp. For the National Championship, executed a major chassis rebuild after acquiring pneumatic cylinders, swapping the motorized clamp for dual single-acting toggle cylinders. This cut clamp time to under 0.15s, eliminated motor thermal throttling, and freed motor power for the front 4-bar linkage lift.",
        feaAnalysis: {
          software: "Onshape CAD & Kinematics",
          meshElements: "Dynamic moment distribution across 4-bar pivot axles under cantilevered goal load.",
          loadCases: "Platform climb impact shock and 25 N defensive side loads.",
          maxStress: "112 MPa on primary aluminum 4-bar lift c-channels (Yield: 240 MPa).",
          minFOS: "2.14 under dynamic shock load.",
          deflection: "Under 1.2 mm lateral arm sway during full extension."
        },
        manufacturing: {
          processes: [
            "Precision aluminum C-channel structural cutting and squaring",
            "Delrin bushing precision reaming and low-friction shoulder bolt pivots",
            "Pneumatic tubing routing with high-flow solenoid manifold",
            "C++ autonomous pathing routines with optical shaft encoder odometry"
          ],
          bom: [
            { item: "V5 Smart Motors (11W)", material: "Brushless DC Servos", qty: 6, unitCost: "£45.00" },
            { item: "Pneumatic Cylinders", material: "SMC Pneumatics", qty: 2, unitCost: "£28.00" },
            { item: "High-Strength Gears", material: "Acetal Spur Gears", qty: 6, unitCost: "£7.50" }
          ]
        },
        testingValidation: "Validated tipping platform balancing stability with 2 fully loaded mobile goals. Achieved sub-0.15s pneumatic goal latching and zero air-leak pressure hold over 2-minute tournament matches.",
        lessonsLearned: "Initial direct-drive 4-bar lift suffered motor overheating under continuous cycle loads. Added rubber-band assist cantilevers creating a mechanical counter-balance that reduced motor stall current by 54%.",
        downloads: [
          { name: "CAD Mechanism Architecture (STEP)", type: "cad", url: "#cad-tp" }
        ]
      }
    },
    {
      id: "vex-spin-up",
      title: "VEX Spin Up World Championships Robot",
      subtitle: "Dual-Motor Flywheel Launcher & Actuated Ballistic Deflector",
      category: "robotics",
      categoryLabel: "Robotics & Competition",
      featured: true,
      has3DCadViewer: false,
      pageUrl: "projects/vex-spin-up.html",
      thumbnail: "assets/projects/vex-spin-up.jpg",
      badge: "World Championships Dallas, Texas",
      summary: "Represented the UK at the VEX Robotics World Championships in Dallas, Texas. Designed a high-speed flywheel disc launching mechanism with a pneumatically actuated angle deflector for disc trajectory control, alongside custom 4-bar linkages and endgame expansion.",
      keyMetrics: [
        { label: "Global Standing", value: "World Championships Qualifier" },
        { label: "Shooter Velocity", value: "3,000+ RPM Compound Flywheel" },
        { label: "Rebuild Focus", value: "Nationals & Worlds Overhaul" },
        { label: "Accolades", value: "22 Regional & National Awards" }
      ],
      tags: ["VEX Spin Up", "World Championships", "Flywheel Dynamics", "Ballistic Launcher", "Four-Bar Linkage", "Dallas Texas"],
      caseStudy: {
        problemStatement: "Competitive robotics games require sub-second cycle times, consistent ballistic trajectory from varying field coordinates, and robust mechanical mechanisms that withstand severe match impacts without structural deformation.",
        designConstraints: [
          "Must fit within strict 18-inch x 18-inch x 18-inch starting sizing envelope.",
          "Rapid cycle flywheel launcher capable of variable distance shots across the 12ft field.",
          "High-speed intake linkage to collect discs directly from floor and loading zones.",
          "Reliable autonomous programming for high-scoring 15-second opening routines."
        ],
        engineeringProcess: "Early regional robot suffered from static hood flex and slow RPM recovery between shots (~350ms). Executed a major rebuild for Nationals & Worlds: engineered a 36:1 compound gear reduction with dual 11W motors, added a steel ballast flywheel to store rotational kinetic energy, integrated an actuated pneumatic angle deflector hood, and deployed 4-bar chain intakes.",
        feaAnalysis: {
          software: "Autodesk Inventor / Onshape CAD",
          meshElements: "Dynamic moment analysis on high-speed shaft cantilever bearings.",
          loadCases: "Full speed match collisions and high-RPM flywheel gyroscopic forces.",
          maxStress: "Maintained within structural aluminum extrusion yield limits.",
          minFOS: "> 2.5",
          deflection: "Flywheel backing plate deflection under 0.2mm to preserve launch compression."
        },
        manufacturing: {
          processes: [
            "Precision custom polycarbonate machining and heat forming",
            "Aluminum C-channel precision squaring and custom axle turning",
            "C++ autonomous coding and closed-loop velocity PID motor tuning"
          ],
          bom: [
            { item: "V5 Smart Motors (11W)", material: "Brushless DC Servo", qty: 8, unitCost: "£45.00" },
            { item: "Compound High-Speed Gearing", material: "High-Strength Acetal", qty: 6, unitCost: "£8.00" },
            { item: "Pneumatic Double-Acting Cylinders", material: "SMC Pneumatics", qty: 2, unitCost: "£28.00" }
          ]
        },
        testingValidation: "Over 200 hours of driver practice and autonomous routine validation. Secured £10,000+ in sponsorship funding, won 22 total regional/national awards, and represented the UK at the World Championships in Dallas, Texas.",
        lessonsLearned: "Flywheel launch consistency depends heavily on compression against the hood. By replacing static foam backing with an adjustable spring-loaded polycarbonate hood and pneumatic deflector, shot dispersion was reduced by 65% and recovery time dropped to sub-80ms.",
        downloads: [
          { name: "CAD Model Package (STEP)", type: "cad", url: "#cad-vex-spinup" }
        ]
      }
    },
    {
      id: "vex-over-under",
      title: "VEX Over Under Robot",
      subtitle: "Pneumatic PTO Transmission, 6-Motor Drive & 3ft Elevating Winch",
      category: "robotics",
      categoryLabel: "Robotics & Competition",
      featured: true,
      has3DCadViewer: false,
      pageUrl: "projects/vex-over-under.html",
      thumbnail: "assets/projects/vex-over-under.jpg",
      badge: "Pneumatic PTO Transmission",
      summary: "Engineered a pneumatic power take-off (PTO) transmission to bypass strict 8 motor constraints, shifting all 6 drive motors to a high torque winch paired with an elastically tensioned, pneumatically deployed latching arm to elevate the robot 3ft.",
      keyMetrics: [
        { label: "PTO Transmission", value: "6-Motor Dual-State PTO" },
        { label: "Climb Height", value: "3ft Elevation Winch" },
        { label: "Rebuild Focus", value: "Worlds 6-Motor Winch Rebuild" },
        { label: "Chassis Drive", value: "6-Motor 360 RPM Omni" }
      ],
      tags: ["VEX Over Under", "PTO Transmission", "Pneumatic Wings", "High-Torque Winch", "Elevation Hang", "Robotics"],
      caseStudy: {
        problemStatement: "The Over Under game imposed strict 8-motor constraints while requiring both maximum drivetrain pushing power (6 motors) and massive lifting torque for endgame elevation. Required a mechanism to transition from high-speed driving to a 3ft vertical climb without dead-weight motors.",
        designConstraints: [
          "Low chassis height (< 12 inches) to slip under field barrier pipes without catching.",
          "Pneumatic power take-off shifting all 6 drive motors to a high torque winch under 0.1s.",
          "Elastically tensioned, pneumatically deployed latching arm to elevate the robot 3ft.",
          "Pneumatic polycarbonate wings extending pushing span to 36 inches."
        ],
        engineeringProcess: "Iterated through 3 major phases: initial pneumatic climb, followed by a mid-season motorized 4-bar lift (4-motor drive trade-off), an experimental rubber-banded PTO system, and finally a comprehensive Worlds major rebuild featuring a 6-motor sliding-gear PTO transmission driving a central spool winch.",
        feaAnalysis: {
          software: "Onshape CAD & Dynamics",
          meshElements: "Torsional barrier collision stress on polycarbonate wing pivot hinges.",
          loadCases: "High-speed 3.2 m/s barrier impact shock and full 7.5 kg suspended winch load.",
          maxStress: "38 MPa on CNC polycarbonate wing hinges (Yield: 65 MPa).",
          minFOS: "1.71 under full-speed dynamic ramming.",
          deflection: "Wing flex absorbed impact without plastic deformation."
        },
        manufacturing: {
          processes: [
            "CNC routing of 1.5mm and 2mm polycarbonate wing panels",
            "Custom PTO sliding spline hubs with bronze shoulder bushings",
            "Dual-cylinder pneumatic plumbing with quick-exhaust valves",
            "PID speed control and slew-rate acceleration limiting in C++"
          ],
          bom: [
            { item: "V5 Smart Motors (11W)", material: "Brushless DC Servos", qty: 8, unitCost: "£45.00" },
            { item: "Pneumatic Solenoids & Tanks", material: "SMC Pneumatics", qty: 3, unitCost: "£35.00" },
            { item: "Polycarbonate Sheets", material: "Lexan Makrolon", qty: 2, unitCost: "£18.00" }
          ]
        },
        testingValidation: "Tested continuous barrier cycling and verified 100% 3ft elevation winch reliability in tournament finals, winning multiple Tournament Champion titles.",
        lessonsLearned: "4-motor drivetrains lacked pushing authority in elimination matches. Shifting to a pneumatic sliding PTO allowed all 6 drive motors to deliver 360 RPM on the field while instantly supplying massive torque to the elevation winch in the final seconds.",
        downloads: [
          { name: "CAD Assembly & Mechanism Schematics", type: "cad", url: "#cad-overunder" }
        ]
      }
    },
    {
      id: "vex-high-stakes",
      title: "VEX High Stakes Robot",
      subtitle: "Fast-Latch Mogo Clamp, Two-Stage Ring Redirect & Wall Stake Arm",
      category: "robotics",
      categoryLabel: "Robotics & Competition",
      featured: true,
      has3DCadViewer: false,
      pageUrl: "projects/vex-high-stakes.html",
      thumbnail: "assets/projects/vex-high-stakes.jpg",
      badge: "Current Generation System",
      summary: "Developed a competition robot for the High Stakes game with an instant-latching pneumatic mobile goal clamp, a dual-stage floating belt ring intake with automatic redirect sorting, an articulated wall stake scorer, and a ladder climb linkage.",
      keyMetrics: [
        { label: "Goal Clamp", value: "Instant Pneumatic Latch Jaws" },
        { label: "Intake System", value: "Two-Stage Floating Belt & Redirect" },
        { label: "Rebuild Focus", value: "Championship Subsystem Overhaul" },
        { label: "Wall Stake Arm", value: "High-Torque Articulated Scorer" }
      ],
      tags: ["VEX High Stakes", "Mobile Goal Clamp", "Ring Redirect Intake", "Wall Stake Arm", "High Hang", "Robotics"],
      caseStudy: {
        problemStatement: "The High Stakes game requires clamping onto mobile goals at high speed, intaking ring elements from the field floor, sorting/redirecting rings onto mobile goal stakes and neutral wall stakes, and ascending a multi-tier central ladder.",
        designConstraints: [
          "Instant pneumatic mobile goal capture from any approach angle without precision alignment.",
          "High-throughput floating intake belt accommodating multiple stacked rings without jams.",
          "Articulated scoring arm reaching high wall stakes while maintaining a low resting profile.",
          "High-strength ladder climb hooks capable of locking the robot securely at Tier 3."
        ],
        engineeringProcess: "Maintained the robust core architecture while conducting a systematic subsystem rebuild: swapped rigid intake backing for compliant 3D-printed TPU fingers, engineered a dual-stage floating top-roller belt, added an optical color sensor with sub-15ms pneumatic divert gate, and reinforced mogo clamp lead-in ramps.",
        feaAnalysis: {
          software: "Fusion CAD & Finite Element Simulation",
          meshElements: "Structural ladder hook bending moment and mobile goal clamp jaw fatigue.",
          loadCases: "Full robot weight cantilevered during Tier 3 ladder hang (7.2 kg total).",
          maxStress: "82 MPa on aluminum 6061-T6 climb arm (Yield: 276 MPa).",
          minFOS: "3.36 under full suspended robot weight.",
          deflection: "Under 0.8 mm deflection on primary climb hook."
        },
        manufacturing: {
          processes: [
            "Waterjet & CNC routed 6061 aluminum plate brackets",
            "Precision 3D printed TPU intake spools and redirect guides",
            "Pneumatic cylinder toggle linkage optimization",
            "Color sensor integration with sub-millisecond optical sorting logic in C++"
          ],
          bom: [
            { item: "V5 Smart Motors (11W)", material: "Brushless DC Servos", qty: 8, unitCost: "£45.00" },
            { item: "Optical & Distance Sensors", material: "VEX V5 Sensors", qty: 3, unitCost: "£22.00" },
            { item: "Pneumatic Sub-System", material: "SMC Double-Acting", qty: 2, unitCost: "£32.00" }
          ]
        },
        testingValidation: "Achieved sub-0.2s mobile goal latching and 100% ring color rejection accuracy at full 400 RPM intake speeds. Successfully climbed to Tier 3 on the central ladder in under 2.5 seconds.",
        lessonsLearned: "Ring elements tend to bounce off rigid intake backing plates when entering at speed. Adding compliant TPU 3D printed flexible fingers increased intake grip and intake success rate from 78% to 99%.",
        downloads: [
          { name: "Full CAD Mechanism Package (STEP)", type: "cad", url: "#cad-highstakes" }
        ]
      }
    }
  ],

  skills: [
    {
      category: "CAD & Software",
      items: [
        { name: "SolidWorks", desc: "Detailed mechanical design, stepped transmission shafts, spur gear assemblies, 2D engineering drawings with ISO limits and fits and keyway geometries." },
        { name: "Autodesk Fusion", desc: "Parametric 3D solid modeling, modular enclosures, treat shooting mechanisms, 3D printing CAM." },
        { name: "Autodesk Inventor", desc: "Kinematic mechanism assemblies, dynamic stress modeling, structural C-channel frames." },
        { name: "Onshape", desc: "Cloud CAD collaboration, multi-part studio modeling, revision management." },
        { name: "Python & Arduino IDE", desc: "Data analysis, scientific computing, embedded C/C++ firmware, serial communications, motor PID tuning." }
      ]
    },
    {
      category: "Electronics & EDA",
      items: [
        { name: "Schematic Capture & PCB Layout", desc: "End-to-end schematic capture, 2-layer PCB layout, power distribution, motor driver routing, voltage regulation." },
        { name: "Microcontrollers (ESP32 & Arduino)", desc: "ESP32 Wi-Fi camera web servers, Arduino Pro Mini (ATmega328P), dual MCU serial communications, PWM control, transistor switching." },
        { name: "Hardware Diagnostics & Testing", desc: "Diagnosing power delivery issues, IC faults on malfunctioning LED panels, benchtop testing, wiring harness assembly." }
      ]
    },
    {
      category: "Manufacturing & Prototyping",
      items: [
        { name: "3D Printing (FDM / SLA)", desc: "Modular PLA/PETG/TPU mechanical enclosures, compliant intake fingers, slicer optimization, infill patterning." },
        { name: "CNC Routing", desc: "In-house desktop CNC isolation milling for custom PCBs, acrylic optical diffusers, and polycarbonate panels." },
        { name: "Laser Cutting", desc: "Precision laser cutting of acrylic optical diffusers and custom enclosures for modular LED displays." },
        { name: "Component Soldering & Assembly", desc: "Component-level through-hole (THT) and surface-mount soldering, wiring harnesses, benchtop testing." },
        { name: "Design for Manufacturing (DFM)", desc: "ISO limits and fits, DIN 6885 keyways, shaft turning tolerances, weld prep, manufacturing routing plans." }
      ]
    }
  ],

  experience: [
    {
      role: "Manufacturing & Technical Assistant",
      organization: "Focus Displays",
      location: "UK",
      period: "Sep 2024 – Aug 2026",
      type: "Industry Experience",
      bullets: [
        "Manufactured custom PCBs for modular LED displays from initial schematic capture to fabrication, component-level soldering, wiring harness assembly, and benchtop testing.",
        "Executed laser cutting and CNC routing of acrylic optical diffusers and enclosures for custom LED displays.",
        "Assisted with on site repairs and installations by diagnosing power delivery issues and IC faults on malfunctioning LED panels."
      ]
    },
    {
      role: "Team Lead and Build / Design Lead",
      organization: "VEX Robotics Competitor",
      location: "UK",
      period: "Nov 2021 – Mar 2025",
      type: "Robotics Leadership",
      links: [
        {
          label: "Instagram @282spectrum",
          url: "https://www.instagram.com/282spectrum/",
          type: "instagram"
        },
        {
          label: "YouTube @vexspectrum",
          url: "https://www.youtube.com/@vexspectrum-282sexsixfours7",
          type: "youtube"
        }
      ],
      bullets: [
        "Founded and led a competitive team at secondary school and sixth form, securing over £10,000 in funding to finance hardware, tools and international travel.",
        "Engineered a pneumatic power take-off transmission to bypass strict 8 motor constraints, shifting all 6 drive motors to a high torque winch paired with an elastically tensioned, pneumatically deployed latching arm to elevate the robot 3ft.",
        "Designed a high speed flywheel disc launching mechanism with a pneumatically actuated angle deflector for disc trajectory control, alongside custom 4-bar linkages, chain-driven intakes and self-aligning clamps.",
        "Led mechanical CAD modelling, and physical prototyping, earning 22 total regional/national awards and representing the UK at the World Championships in Dallas, Texas."
      ]
    }
  ],

  education: [
    {
      institution: "Imperial College London",
      period: "Sep 2025 – Jun 2029",
      degree: "Second Year MEng Mechanical Engineering",
      details: "First Year Grade: Upper Second Class Honours (2:1). London, UK."
    },
    {
      institution: "St Dominic’s Sixth Form College",
      period: "Sep 2023 – Jun 2025",
      degree: "A-Levels: A*, A*, A, A",
      details: "Mathematics (A*), Computer Science (A*), Physics (A), Further Mathematics (A). Harrow, UK."
    },
    {
      institution: "Bushey Meads School",
      period: "Sep 2018 – Jun 2023",
      degree: "GCSE: 9, 9, 9, 9, 9, 9, 9, 8, 8, 7",
      details: "Bushey, UK."
    }
  ]
};

if (typeof window !== "undefined") {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
