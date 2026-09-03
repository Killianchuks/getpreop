"use client";

import { useState } from "react";

const stages = [
  ["Materials Engineering", "Material behavior, interfaces, and engineered systems."],
  ["Biomedical Engineering", "Engineering methods applied to biological questions."],
  ["Cancer Research", "How disease changes cells, tissues, and environments."],
  ["Cancer Biomechanics", "Mechanical characterization of cancer cells."],
  ["Mechanical Biomarkers", "Mechanical signatures as potential diagnostic signals."],
  ["Diagnostic Research", "Measurable biology translated into clinical insight."],
  ["Healthcare Consulting", "Product, regulatory, and technical decisions."],
  ["AI / SaMD", "Responsible pathways for AI-enabled healthcare products."],
  ["Medical Imaging", "DICOM, imaging workflows, and clinical review."],
  ["Digital Health", "Better patient, physician, and operations workflows."],
  ["Regulated Manufacturing", "$10M+ clean utilities and radiopharmaceutical programs."],
  ["Technical Program Leadership", "Engineering, quality, stakeholders, and delivery."],
] as const;

const projects = [
  ["01", "Mechanical Biomarkers for Cancer Detection", "Biomedical Engineering · Cancer Research · Diagnostics", "Can mechanical behavior reveal a measurable signature of cancer?", "Cell mechanics · viscoelasticity · creep · cytoskeletal structure · AFM · statistical analysis", "Research investigating mechanical properties as potential biomarkers for distinguishing malignant and non-malignant cells."],
  ["02", "Engineering the infrastructure behind radiopharmaceutical manufacturing", "Technical Program Management · Pharmaceutical Manufacturing · CQV", "How do you coordinate the infrastructure a highly regulated manufacturing program depends on?", "Clean utilities · engineering · QA · CQV · manufacturing · contractors · supply chain", "Managed and coordinated major clean-utilities projects supporting a new radiopharmaceutical manufacturing program."],
  ["03", "AI and the future of cancer detection", "AI Healthcare · SaMD · Regulatory Strategy", "What must be considered when AI enters a high-consequence clinical workflow?", "AI · clinical problem · product · regulation · validation", "Advisory work involving partners developing AI-enabled breast cancer detection solutions and exploring regulatory pathways."],
  ["04", "MedSecOp", "Product Strategy · Medical Imaging · Digital Health", "How can patients, imaging, and clinical expertise connect more naturally?", "Patient → Imaging → DICOM → Secure Platform → Physician → Expert Review → Patient", "Building a digital bridge between patient workflows, medical imaging, physician workflows, and expert review."],
] as const;

const research = [
  ["Cancer Mechanics", "How do the mechanical properties of cancer cells differ?", "Mechanical characterization, viscoelasticity, creep behavior, cytoskeletal structure, and statistical analysis.", "Work examining mechanical heterogeneity as a potential biological signal."],
  ["Brain Cancer", "What can single-cell mechanics reveal about glioblastoma?", "Single-cell mechanical and viscoelastic properties in the context of glioblastoma, brain metastasis, and the brain microenvironment.", "Work connecting cell mechanics with the environment surrounding brain cancer."],
  ["Tumor Microenvironment", "How do mechanical stress and metabolism shape tumor behavior?", "Mechanical stress, immune escape, and mechanical/metabolic interactions within the tumor microenvironment.", "A systems view of the tumor microenvironment as an active participant in disease progression."],
  ["Biomaterials & Treatment", "How can engineered materials support cancer treatment?", "Magnetite nanoparticles, PDMS, PLGA/PCL, drug delivery, doxorubicin, hyperthermia, and photothermal treatment.", "Research exploring materials and treatment strategies that could improve how cancer is studied and treated."],
] as const;

export function PortfolioHome() {
  const [activeStage, setActiveStage] = useState(3);
  const [activeResearch, setActiveResearch] = useState(0);
  return <main className="portfolio-home">
    <section className="portfolio-hero"><div className="portfolio-wrap portfolio-hero-grid"><div className="reveal"><p className="eyebrow">Killian Onwudiwe, PhD</p><h1>Science.<br /><em>Technology.</em><br />Healthcare.<br /><strong>Execution.</strong></h1><p className="hero-copy">I work across biomedical research, cancer diagnostics, healthcare technology, regulated product development and technical program leadership - turning complex problems into research, products and programs.</p><div className="hero-actions"><a href="#work" className="button button-primary">Explore my work</a><a href="#collaborate" className="button button-light">Collaborate with me</a><a href="mailto:contact@getpreop.com?subject=Work with Killian Onwudiwe" className="button button-light">Work with me</a></div><a href="mailto:contact@getpreop.com?subject=Resume request" className="resume-link">Download résumé <span>↗</span></a></div><div className="hero-visual reveal reveal-delay"><div className="signal-orbit orbit-one" /><div className="signal-orbit orbit-two" /><div className="signal-core"><span>12</span><small>disciplines<br />one throughline</small></div><div className="floating-note note-top">Research<br /><b>curiosity</b></div><div className="floating-note note-bottom">Build<br /><b>with purpose</b></div></div></div></section>
    <section className="statement-band"><div className="portfolio-wrap statement-grid"><p className="eyebrow">The throughline</p><p className="statement">I follow difficult questions until they become something useful.</p></div></section>
    <section id="work" className="career-section"><div className="portfolio-wrap"><div className="section-intro"><p className="eyebrow">Career at a glance</p><h2>A career across disciplines</h2><p>The breadth is not random. Each stage builds on the previous one.</p></div><div className="timeline-track"><div className="timeline-line" style={{ width: `${(activeStage / (stages.length - 1)) * 100}%` }} />{stages.map(([title], index) => <button type="button" key={title} onClick={() => setActiveStage(index)} className={`timeline-node ${activeStage === index ? "active" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{title}</b></button>)}</div><div className="stage-detail"><span className="stage-number">{String(activeStage + 1).padStart(2, "0")}</span><div><p className="eyebrow">Now exploring</p><h3>{stages[activeStage][0]}</h3><p>{stages[activeStage][1]}</p></div></div></div></section>
    <section className="work-section"><div className="portfolio-wrap"><div className="section-intro"><p className="eyebrow">Selected work</p><h2>Work that spans the laboratory, the product and the real world.</h2></div><div className="project-list">{projects.map(([number, title, label, question, work, outcome]) => <article key={number} className="project-row"><div className="project-index">PROJECT {number}</div><div><p className="project-label">{label}</p><h3>{title}</h3><div className="project-content"><p><b>Question</b>{question}</p><p><b>Work</b>{work}</p><p><b>Outcome</b>{outcome}</p></div></div><span className="project-arrow">↗</span></article>)}</div></div></section>
    <section className="research-section"><div className="portfolio-wrap research-grid"><div className="research-heading"><p className="eyebrow">Research</p><h2>Years spent asking how disease changes biology.</h2><p>At the cellular, mechanical, and material levels, the work starts with curiosity and moves toward a clearer question.</p></div><div className="research-tabs">{research.map(([title], index) => <button type="button" key={title} onClick={() => setActiveResearch(index)} className={activeResearch === index ? "selected" : ""}><span>0{index + 1}</span>{title}</button>)}<div className="research-story"><p className="eyebrow">The question</p><h3>{research[activeResearch][1]}</h3><p className="eyebrow">The approach</p><p>{research[activeResearch][2]}</p><p className="eyebrow">The finding</p><p>{research[activeResearch][3]}</p><div className="research-visual"><span className="cell cell-a" /><span className="cell cell-b" /><span className="cell cell-c" /><i>mechanics → meaning</i></div></div></div></div></section>
    <section id="collaborate" className="collaborate-section"><div className="portfolio-wrap collaborate-grid"><div><p className="eyebrow">Open to the next hard problem</p><h2>Bring me a question worth following.</h2></div><div><p>I collaborate with researchers, healthcare organizations, product teams, and operators who need to move from complexity to clarity - then from clarity to execution.</p><a href="mailto:contact@getpreop.com?subject=Collaboration inquiry" className="button button-dark">Start a conversation ↗</a></div></div></section>
  </main>;
}
