/* Portfolio content. Edit text here, presentation lives in app.js and styles.css */
window.PORTFOLIO = {
  person: {
    name: "Naga Durga Jagadeesh Lanka",
    shortName: "Jagadeesh Lanka",
    headline: "Mechanical Engineer and Freelance Technical Designer",
    location: "Cincinnati, Ohio",
    email: "lankanh@mail.uc.edu",
    linkedin: "https://www.linkedin.com/in/lankajagadeesh",
    linkedinLabel: "linkedin.com/in/lankajagadeesh",
    intro: "I am a mechanical engineer with five years of freelance experience. My work covers mechanical design, engineering simulation, robotics, digital content, and technical documentation. I use CAD models, drawings, simulation workflows, and clear documentation to explain technical ideas and support design decisions.",
    about: [
      "I am completing a Master of Engineering in Mechanical Engineering at the University of Cincinnati, expected in December 2026. Before this I earned a BTech in Mechanical Engineering from NIT Manipur.",
      "Alongside engineering design and simulation, my freelance work includes game development, visual asset creation, video editing, and scientific data visualisation. I bring these areas together through careful modelling, structured problem solving, and attention to the final deliverable.",
      "My main interest is practical work that connects engineering design with digital tools. I value clear requirements, careful review, and files that another engineer or developer can understand and continue working with."
    ],
    education: [
      { degree: "Master of Engineering, Mechanical Engineering", school: "University of Cincinnati", note: "Expected December 2026" },
      { degree: "BTech, Mechanical Engineering", school: "National Institute of Technology Manipur", note: "2024" }
    ],
    certification: "CAPM (Certified Associate in Project Management)",
    resume: "assets/Naga_Durga_Jagadeesh_Lanka_Resume.pdf"
  },

  experience: [
    { role: "Mechanical Designer (Remote)", org: "Zouka Solutions, Hyderabad, India", dates: "May 2026 to Jul 2026", span: [86.7, 91.7], link: "bom-records",
      text: "Remote CAD and documentation work for senior engineers.",
      details: ["Developed and updated 3D CAD models in SolidWorks, AutoCAD, and Creo from design specifications", "Converted 2D engineering drawings into 3D models and produced drawings with dimensions, tolerances, and GD&T", "Incorporated design review changes with version control and maintained BOMs in Excel and PLM", "Ran fit checks, interference analysis, and introductory FEA, coordinating with manufacturing and procurement"],
      skills: ["SolidWorks", "AutoCAD", "Creo", "GD&T", "PLM", "Excel"] },
    { role: "Graduate Research Assistant, UPRISE Project (NSF funded)", org: "University of Cincinnati", dates: "Dec 2025 to Apr 2026", span: [78.3, 86.7],
      text: "Research synthesis for an NSF funded team.",
      details: ["Reviewed and synthesised more than 50 technical studies into structured analytical reports", "Built a research tracker across more than 30 studies to organise findings and surface gaps"] },
    { role: "Technical AI Reviewer and Evaluator", org: "Mercor, Handshake AI, Outlier", dates: "Jul 2025 to present", span: [70, 96.7], link: "puzzle-game",
      text: "Technical review and evaluation design across engineering, software, and agents.",
      details: ["Reviewed AI generated code against requirements, execution evidence, and scoring criteria", "Wrote engineering and STEM evaluations covering toleranced drawings, CAD reconstruction, and mechanical systems", "Built playable applications in Defold, Panda3D, and Godot and defined functional acceptance criteria", "Analysed agent execution traces for reasoning and tool use failures"] },
    { role: "Design Engineer Intern", org: "GSR Engineering, Hyderabad, India", dates: "Jan 2024 to May 2024", span: [40, 48.3],
      text: "Prototype design and documentation.",
      details: ["Prototyped and validated a user driven floor scrubbing machine combining dry vacuuming and wet mopping", "Sized the drivetrain and ran fit and interference checks before fabrication", "Produced fabrication drawings, a bill of materials, and design documentation"] },
    { role: "Engineering Intern", org: "Oil and Natural Gas Corporation (ONGC), India", dates: "May 2022 to Jun 2022", span: [6.7, 10],
      text: "Gas compression systems.",
      details: ["Analysed gas compression capacity control systems", "Researched gas compressor lubrication to reduce maintenance downtime", "Evaluated and adjusted compressor trip and alarm set points"] }
  ],

  filters: ["Engineering", "Robotics", "Interactive Media", "Scientific Visualisation", "Technical Documentation"],

  capabilities: [
    { title: "Engineering design and simulation", text: "Parametric CAD, assemblies, drawings, CFD workflows, structural analysis, and design documentation." },
    { title: "Robotics and interactive development", text: "Robot simulation, sensor integration, game logic, asset integration, and functional testing." },
    { title: "Digital content and visualisation", text: "2D and 3D assets, product videos, scientific imaging, spatial mapping, and clear technical communication." }
  ],

  process: [
    { step: "Requirements", text: "I begin with the technical requirements and the purpose of the final output, so the model or asset is built for how it will be used." },
    { step: "Build", text: "I create the CAD model, mesh, simulation case, code, or content in the tool that suits that stage of the work." },
    { step: "Check", text: "I run checks that suit the task, such as interference and fit, mesh convergence, reaction balance, frame timing, or coordinate systems." },
    { step: "Document and deliver", text: "I write clear documentation and hand over organised files in the formats the next person needs." }
  ],

  toolNote: "Experience ranges reflect the listed tool or a comparable tool within the same category. They describe tool experience and are separate from my overall five years of freelance work.",

  tools: [
    { group: "Mechanical CAD", items: [
      ["FreeCAD", "3 to 5 years"], ["OpenSCAD", "1 to 2 years"], ["SolveSpace", "1 to 2 years"], ["Rhino 3D", "1 to 2 years"],
      ["AutoCAD Mechanical", "5 or more years"], ["Autodesk Inventor", "3 to 5 years"], ["LibreCAD / QCAD CE", "1 to 2 years"],
      ["SolidWorks", "3 years"], ["CATIA", "2 years"], ["Fusion 360", "2 years"] ] },
    { group: "Computational fluid dynamics", items: [
      ["STAR-CCM+", "Under 1 year"], ["SolidWorks Flow Simulation", "1 to 2 years"], ["Autodesk CFD", "1 to 2 years"] ] },
    { group: "Finite element analysis", items: [
      ["Abaqus", "3 to 5 years"], ["ANSYS Mechanical / Workbench", "1 to 2 years"], ["COMSOL Multiphysics", "Under 1 year"], ["HyperMesh", "1 to 2 years"] ] },
    { group: "Robotics simulation", items: [ ["Gazebo", "2 years"] ] },
    { group: "2D and 3D art", items: [
      ["Inkscape", "1 to 2 years"], ["Krita", "1 to 2 years"], ["LibreSprite", "3 to 5 years"], ["Blender", "3 to 5 years"] ] },
    { group: "Game development", items: [
      ["Godot, Defold, Solar2D, Panda3D, Open 3D Engine (O3DE), Stride (Xenko), LibGDX, Cocos2d-x, Three.js Editor", "3 to 5 years"] ] },
    { group: "Video production", items: [ ["OpenShot", "1 to 2 years"], ["Shotcut", "1 to 2 years"], ["Lightworks", "3 to 5 years"] ] },
    { group: "Scientific imaging and GIS", items: [ ["ParaView", "3 to 5 years"], ["3D Slicer", "1 to 2 years"], ["QGIS", "Under 1 year"] ] },
    { group: "Office and data analysis", items: [
      ["LibreOffice or similar office suites", "3 to 5 years"], ["Google Workspace", "4 years"], ["WPS Office", "2 years"],
      ["Microsoft Excel, Word, and PowerPoint", "Office toolset"] ] }
  ],

  supportingTools: ["Creo", "Onshape", "ROBOGUIDE", "Python", "ROS 2", "MATLAB", "SQL", "Power BI"],

  /* Featured projects appear first, in this order */
  featured: ["motor-mount", "bracket-fea", "enclosure-cfd", "turtlebot", "puzzle-game"],

  projects: [
    {
      id: "motor-mount", num: "02", title: "Adjustable motor mounting assembly",
      area: "Mechanical CAD", filters: ["Engineering", "Technical Documentation"],
      summary: "Parametric mounting assembly for a conveyor drive with slotted brackets for belt tension adjustment.",
      tools: [
        ["SolidWorks", "Parametric part models, assembly mates with standard fasteners, and interference detection."],
        ["OpenSCAD", "Script-driven spacer variants, so a new thickness was one parameter change."],
        ["FreeCAD", "Inspecting supplier STEP files before bringing them into the main assembly."],
        ["AutoCAD Mechanical", "Manufacturing drawings with dimensions, hole tables, material notes, and tolerances."]
      ],
      description: "I designed an adjustable motor mounting assembly for a client conveyor system, including a base plate, slotted brackets, spacers, and a protective cover. I used SolidWorks to create parametric part models and assemble the components with standard fasteners. I checked shaft alignment, bolt clearances, and interference between parts, then adjusted the mounting slots to allow belt tension adjustment. I used OpenSCAD to generate spacer variants and FreeCAD to inspect supplier STEP files before including them in the design. I prepared manufacturing drawings in AutoCAD Mechanical with dimensions, hole locations, material specifications, and tolerances for mating features.",
      role: "CAD design, drawing revisions, bill of materials, and preparation of STEP, DXF, and PDF files for manufacturing review.",
      workflow: [
        ["Geometry", "Base plate, slotted brackets, spacers, and cover modelled as parametric parts driven by motor frame size."],
        ["Assembly", "Components mated with standard M8 fasteners and the supplier motor STEP model."],
        ["Fit checks", "Shaft alignment, bolt clearance, and interference detection across the full slot travel."],
        ["Drawings", "Dimensioned part drawings, hole locations, material specification, and mating tolerances."]
      ],
      metrics: [["Slot travel", "30 mm"], ["BOM line items", "12"], ["Interferences at final revision", "0"], ["Drawing sheets", "6"], ["Material", "ASTM A36, 10 mm plate, 8 mm brackets"]],
      checks: ["Fit and interference across slot travel", "Fastener tool access", "Drawing dimensions against model", "Model revision consistency"],
      deliverables: ["Part and assembly models", "Bill of materials", "Dimensioned drawings", "STEP, DXF, and PDF exports"],
      figures: ["mmAssembly", "mmExploded", "mmDrawing", "mmBom"]
    },
    {
      id: "bracket-fea", num: "07", title: "Motor bracket structural analysis",
      area: "Finite element analysis", filters: ["Engineering"],
      summary: "Static, modal, and thermal expansion study of an electric motor mounting bracket.",
      tools: [
        ["HyperMesh", "Geometry clean up and a controlled mesh with local refinement at bolt holes and fillets."],
        ["Abaqus", "Static analysis with bolt preload, contact, and operating loads for stress and displacement."],
        ["ANSYS Mechanical", "Modal analysis to compare natural frequencies with motor excitation."],
        ["COMSOL Multiphysics", "A basic thermal expansion model to estimate deformation from temperature change."]
      ],
      description: "I analysed an electric motor mounting bracket for a client to assess its strength, vibration behaviour, and thermal expansion. I used HyperMesh to clean the geometry and create a mesh with local refinement around bolt holes and fillets. In Abaqus, I defined material properties, bolt preload, contact conditions, and operating loads to evaluate stress and displacement. I performed modal analysis in ANSYS Mechanical to compare the bracket natural frequencies with the motor operating excitation frequencies. I also created a basic thermal expansion model in COMSOL Multiphysics to estimate deformation caused by temperature changes. I checked mesh convergence and reviewed reaction forces against the applied loads before interpreting the structural results.",
      role: "Model preparation, reviewing results, and recommending changes to bracket thickness and fillet size for prototype testing.",
      workflow: [
        ["Geometry and meshing", "Defeatured CAD in HyperMesh, second order tetrahedral mesh with refinement at holes and fillets."],
        ["Setup", "ASTM A36 properties, 10 kN preload on four M8 bolts, frictional contact at the mounting face, 500 N vertical and 150 N lateral belt load."],
        ["Solving", "Static solve in Abaqus, modal solve in ANSYS Mechanical, thermal expansion in COMSOL."],
        ["Post-processing", "Stress and displacement plots, mode shapes, and reaction force balance against applied load."]
      ],
      metrics: [["Peak von Mises stress", "120 MPa"], ["Factor of safety (yield)", "2.08"], ["First natural frequency", "95 Hz"], ["Motor excitation", "25 Hz at 1,500 rpm"], ["Max displacement", "0.18 mm"]],
      checks: ["Constraints and contact assumptions", "Element quality", "Mesh convergence", "Reaction forces against applied load", "Stress concentrations"],
      deliverables: ["Mesh files", "Structural and modal setup records", "Stress and displacement plots", "Design review report"],
      figures: ["feaMesh", "feaBC", "feaStress", "feaConvergence"]
    },
    {
      id: "enclosure-cfd", num: "06", title: "Electronics enclosure cooling",
      area: "Computational fluid dynamics", filters: ["Engineering"],
      summary: "Airflow and heat transfer study to find hot spots and recommend a vent layout.",
      tools: [
        ["SolidWorks Flow Simulation", "Baseline case with material properties, component heat loads, inlet flow, and outlet pressure."],
        ["Autodesk CFD", "Fast comparison of vent locations and airflow rates."],
        ["STAR-CCM+", "One cross check case on the same geometry and operating conditions."]
      ],
      description: "I analysed airflow and heat transfer inside a client electronics enclosure to identify hot spots and improve cooling. I used SolidWorks Flow Simulation to define material properties, component heat loads, inlet airflow, and outlet pressure. In Autodesk CFD, I compared different vent locations and airflow rates by reviewing temperature contours, velocity fields, and pressure drop. I also set up one comparison case in STAR-CCM+ using the same geometry and operating conditions to check whether the predicted flow patterns were consistent. I refined the mesh near the vents and heated components, then monitored residuals and component temperatures to check convergence.",
      role: "Simulation setup, comparing design options, and preparing a technical report with a recommended vent layout for prototype testing.",
      workflow: [
        ["Geometry", "Simplified enclosure with processor module (30 W), power supply (20 W), driver and control boards (5 W each), inlet fan, and outlet vents."],
        ["Meshing", "Refinement at vents and around heated components."],
        ["Solving", "Conjugate heat transfer with monitored residuals and component temperatures."],
        ["Post-processing", "Temperature contours, velocity fields, pressure drop, and a comparison table."]
      ],
      metrics: [["Peak component temperature, baseline", "78 °C"], ["Peak component temperature, recommended", "65 °C"], ["Pressure drop", "48 to 32 Pa"], ["Total heat load", "60 W"], ["Vent layouts compared", "3"]],
      checks: ["Boundary conditions", "Material data", "Mesh sensitivity", "Mass and heat balance", "Convergence"],
      deliverables: ["Simulation setup records", "Contour plots", "Comparison table", "Cooling design recommendation"],
      figures: ["cfdGeometry", "cfdContour", "cfdCompare"]
    },
    {
      id: "turtlebot", num: "08", title: "TurtleBot3 obstacle avoidance",
      area: "Robotics simulation", filters: ["Robotics"],
      summary: "LiDAR based obstacle avoidance for a TurtleBot3, tested in Gazebo and on the physical robot.",
      tools: [
        ["Gazebo", "Simulated world with static and moving obstacles for repeatable tests."],
        ["ROS 2", "Topics connecting the LiDAR scan to velocity commands."],
        ["Python", "The avoidance control node."],
        ["LiDAR and TurtleBot3", "The 360 degree scan and the physical test platform."]
      ],
      description: "I developed a LiDAR-based obstacle avoidance system for a TurtleBot3 mobile robot using Gazebo, ROS 2, and Python. I used Gazebo to simulate the robot movement and test navigation around obstacles. I wrote the control logic in Python and used ROS 2 to connect sensor inputs with movement commands. I integrated LiDAR data so the robot could detect obstacles and adjust its movement. I evaluated navigation performance through Gazebo simulations and real-world testing, including movement around dynamic obstacles.",
      role: "Control programming, sensor integration, and testing the obstacle avoidance system.",
      workflow: [
        ["Simulation", "5 × 5 m Gazebo arena with 0.30 m boxes, 0.25 m cylinders, and one obstacle moving at 0.10 m/s."],
        ["Sensing", "Scan split into front, left, and right sectors with nearest range per sector."],
        ["Control", "Python node publishing velocity commands based on sector distances."],
        ["Testing", "Simulation runs first, then physical runs, with observations recorded separately."]
      ],
      metrics: [["Safety distance threshold", "0.30 m"], ["Scan rate", "5 Hz"], ["Simulation runs without collision", "58 of 60"], ["Physical runs without collision", "18 of 20"], ["Forward speed", "0.15 m/s"]],
      checks: ["Simulation observations kept separate from physical observations", "Test conditions recorded with every result"],
      deliverables: ["Python control logic", "ROS 2 integration", "Gazebo simulation work", "Navigation test documentation"],
      figures: ["tbScene", "tbGraph", "tbLidar"]
    },
    {
      id: "puzzle-game", num: "03", title: "Puzzle game development",
      area: "Game development", filters: ["Interactive Media"],
      summary: "2D crate and switch puzzle game built in Godot, with a Defold comparison level for Android.",
      tools: [
        ["Godot and GDScript", "Main game, player movement, collisions, puzzle logic, and checkpoint saving."],
        ["Defold and Lua", "One test level rebuilt to compare control response and loading time on Android."]
      ],
      description: "I developed a 2D puzzle game for a client using Godot, where players moved crates, activated switches, and unlocked different levels. I used GDScript to implement player movement, collision handling, puzzle logic, and checkpoint saving. I organised the levels into reusable scenes and added menus, sound effects, and keyboard and touch controls. I also recreated one test level in Defold using Lua to compare the control response and loading time on Android. During testing, I fixed collision issues, reduced texture sizes, and removed unnecessary updates to improve performance.",
      role: "Gameplay programming, asset integration, debugging, and preparing desktop and Android builds for testing.",
      workflow: [
        ["Controls", "Keyboard arrows or WASD on desktop, swipe and on screen pad on Android."],
        ["Game states", "Menu, playing, paused, level complete, and restart from checkpoint."],
        ["Assets", "Tile sets, crate and switch sprites, menu graphics, and sound effects in reusable scenes."],
        ["Platform targets", "Windows desktop build and Android APK."]
      ],
      metrics: [["Levels", "6"], ["Frame rate", "60 desktop, 55 to 60 Android"], ["Platforms", "Desktop and Android"], ["Texture memory", "64 to 32 MiB"]],
      checks: ["Movement and collisions", "Switch states", "Checkpoints", "Level transitions", "Restart behaviour", "Touch controls"],
      deliverables: ["Game source files", "Playable builds", "Level scenes", "Control guide", "Functional test record"],
      figures: ["pgLevel", "pgStates"]
    },
    {
      id: "game-assets", num: "01", title: "Game asset design",
      area: "2D and 3D art", filters: ["Interactive Media"],
      summary: "Environment concepts, vector UI icons, pixel sprites, and rendered props for a game prototype.",
      tools: [
        ["Krita", "Environment concept sketches and the colour palette."],
        ["Inkscape", "Vector icons and menu graphics that scale cleanly."],
        ["Blender", "Simple props, materials, and reference renders for the 2D art."],
        ["LibreSprite", "Pixel art objects and frame by frame animation exported as sprite sheets."]
      ],
      description: "I created visual assets for a client game prototype using Krita, Inkscape, LibreSprite, and Blender. I used Krita to sketch environment concepts and develop a consistent colour palette for the assets. In Inkscape, I designed vector icons and menu graphics that could be resized without losing quality. I used Blender to model simple props, apply materials, and render reference images for the 2D artwork. In LibreSprite, I created pixel art objects and frame-by-frame animations, then exported them as sprite sheets for use in the game.",
      role: "Creating the assets, checking their dimensions and visual consistency, and preparing the final files for integration.",
      workflow: [
        ["Concept", "Environment sketches and a fixed palette in Krita."],
        ["Vector UI", "Icons and menu frames in Inkscape on a shared grid."],
        ["Props", "Low poly props in Blender rendered as references."],
        ["Sprites", "Pixel animation in LibreSprite exported as sprite sheets."]
      ],
      metrics: [["Sprite size", "64 × 64 px"], ["Palette", "32 entries"], ["UI icons", "24"], ["Walk cycle", "8 frames at 12 fps"]],
      checks: ["Sprite dimensions", "Transparent backgrounds", "Animation timing", "Icon readability", "Consistent colour use"],
      deliverables: ["Environment artwork", "SVG interface icons", "PNG assets", "Sprite sheets", "Blender prop files"],
      figures: ["gaSprites", "gaIcons", "gaPalette"]
    },
    {
      id: "product-video", num: "04", title: "Product demonstration video",
      area: "Video production", filters: ["Interactive Media", "Technical Documentation"],
      summary: "Three minute product demonstration for a manufacturing client plus short promotional cuts.",
      tools: [
        ["Lightworks", "Organising footage, removing repeated takes, and building the main sequence."],
        ["Shotcut", "Exposure, white balance, and audio level correction."],
        ["OpenShot", "Short promotional clips with title cards, step labels, and transitions."]
      ],
      description: "I edited a three-minute product demonstration video for a manufacturing client using Lightworks, Shotcut, and OpenShot. I used Lightworks to organise the footage, remove repeated takes, and arrange a clear sequence showing product setup and operation. In Shotcut, I adjusted exposure, white balance, and audio levels to keep the visuals and narration consistent. I used OpenShot to create shorter promotional clips with title cards, step labels, and simple transitions. I exported the main video as a 1080p H.264 MP4 file and checked audio synchronisation, text readability, and playback quality.",
      role: "Editing, incorporating review comments, and preparing the final versions for the company website and social media.",
      workflow: [
        ["Assembly edit", "Footage organised into setup, operation, and close sections."],
        ["Correction", "Exposure, white balance, and narration levels matched across clips."],
        ["Short cuts", "Promotional clips with title cards and step labels."],
        ["Export", "1080p H.264 MP4 with playback review."]
      ],
      metrics: [["Main video", "3:00"], ["Resolution", "1920 × 1080, H.264 MP4"], ["Short cuts", "15, 30, and 45 s"], ["Loudness target", "-16 LUFS, -1 dBTP"]],
      checks: ["Audio levels", "Synchronisation", "Colour consistency", "Spelling", "Framing", "Exported playback"],
      deliverables: ["Main demonstration video", "Shorter promotional cuts", "Title graphics", "Organised editing project"],
      figures: ["pvTimeline", "pvPoster"]
    },
    {
      id: "rock-imaging", num: "05", title: "Rock imaging and spatial analysis",
      area: "Scientific imaging and GIS", filters: ["Scientific Visualisation"],
      summary: "CT segmentation of rock samples linked to a map of sample collection sites.",
      tools: [
        ["3D Slicer", "Segmenting pores and solid material and building 3D models."],
        ["ParaView", "Cross sections and volume rendering to compare pore distribution."],
        ["QGIS", "Mapping sampling coordinates and joining them to measurements."]
      ],
      description: "I completed a rock sample analysis assignment that combined CT imaging with maps of sample collection locations. I used 3D Slicer to segment pores and solid material from the scans and create 3D models of the internal structure. I checked image spacing and segmentation boundaries before measuring the pore volume in each sample. In ParaView, I inspected the exported volume data using cross-sectional slices and volume rendering to compare pore distribution across samples. I used QGIS to map the sampling coordinates and link each location to its corresponding measurements.",
      role: "Image processing, checking the segmentation results, preparing the location map, and producing figures and measurement tables for the client report.",
      workflow: [
        ["Image spacing", "Voxel size of 20 µm confirmed from scan headers, with 10 mm cubic regions of interest."],
        ["Segmentation", "Threshold segmentation of pore and solid phases with manual boundary checks."],
        ["Coordinate system", "Sample sites mapped in WGS 84 and joined by sample identifier."],
        ["Units", "Pore volume in mm³ and porosity as a percentage of sample volume."]
      ],
      metrics: [["Voxel size", "20 µm"], ["Samples", "3"], ["Porosity range", "10.8 to 17.6 %"], ["Coordinate system", "WGS 84, EPSG:4326"]],
      checks: ["Voxel dimensions", "Segmentation boundaries", "Sample identifiers", "Coordinate reference systems", "Units"],
      deliverables: ["Segmentation files", "Volume visualisations", "Sampling location map", "Measurement table"],
      figures: ["riSlice", "riMap", "riTable"]
    },
    {
      id: "bom-records", num: "09", title: "Engineering records and bill of materials",
      area: "Office and data analysis", filters: ["Technical Documentation", "Engineering"],
      summary: "BOM and revision records kept aligned with CAD and drawings at Zouka Solutions.",
      tools: [
        ["Microsoft Excel", "Bills of materials and component lists with lookup checks."],
        ["Engineering drawings", "The reference for part numbers and revisions."],
        ["PLM records", "Controlled revisions and change history."]
      ],
      description: "I used Microsoft Excel to maintain bills of materials and component lists for mechanical design work at Zouka Solutions. I organised component information and kept the records aligned with CAD models and engineering drawings. When designs changed during reviews, I updated the documentation and maintained revision control. I coordinated with manufacturing and procurement teams to clarify component requirements and support design feasibility checks.",
      role: "Spreadsheet maintenance, documentation updates, and preparing technical records for engineering review.",
      workflow: [
        ["Capture", "Part numbers, descriptions, quantities, and materials taken from the model tree."],
        ["Cross check", "BOM rows checked against drawing title blocks and revisions."],
        ["Change", "Review changes logged with a revision letter and reason."],
        ["Release", "Updated records shared with manufacturing and procurement."]
      ],
      metrics: [["BOM line items maintained", "120"], ["Revisions logged", "8"], ["Teams coordinated", "Manufacturing and procurement"]],
      checks: ["Part references", "Drawing revisions", "Component lists", "Consistency between records and models"],
      deliverables: ["Bills of materials", "Component lists", "Updated engineering records", "Controlled design documentation"],
      figures: ["bomRevision", "bomFlow"]
    }
  ]
};
