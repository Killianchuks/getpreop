"use client";

import { Camera, CameraOff, Mic, MicOff, PhoneOff, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function VideoAssessmentRoom({
  role,
  patientName = "Patient",
  physicianName = "Dr. Amara Chen",
  backHref,
}: {
  role: "patient" | "clinician";
  patientName?: string;
  physicianName?: string;
  backHref: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [joined, setJoined] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function joinRoom() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraEnabled(true);
      setMicrophoneEnabled(true);
      setJoined(true);
      setNotice("");
    } catch {
      setNotice("Camera and microphone access is needed to join the assessment.");
    }
  }

  function toggleTrack(kind: "video" | "audio") {
    const enabled = kind === "video" ? !cameraEnabled : !microphoneEnabled;
    streamRef.current?.getTracks().filter((track) => track.kind === kind).forEach((track) => { track.enabled = enabled; });
    kind === "video" ? setCameraEnabled(enabled) : setMicrophoneEnabled(enabled);
  }

  function leaveRoom() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
    setJoined(false);
  }

  const otherPerson = role === "clinician" ? patientName : physicianName;
  return <main className="w-full max-w-none bg-slate-950 p-0 text-white"><section className="mx-auto min-h-[calc(100vh-65px)] max-w-7xl px-5 py-7 sm:px-8 lg:px-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">GetPreOp virtual assessment</p><h1 className="mt-1 text-2xl font-bold">Preoperative video visit</h1></div><Link href={backHref} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">Leave room</Link></div><div className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]"><div className="overflow-hidden rounded-lg bg-slate-900"><div className="relative aspect-video bg-slate-800"><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-xl font-bold">{otherPerson.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><p className="mt-4 font-semibold">{otherPerson}</p><p className="mt-1 text-sm text-slate-400">{joined ? "Waiting to join" : "Join when you are ready"}</p></div><video ref={videoRef} autoPlay muted playsInline className={`absolute bottom-4 right-4 aspect-video w-40 rounded-lg border border-white/20 bg-slate-950 object-cover shadow-lg ${cameraEnabled ? "block" : "hidden"}`} /></div><div className="flex items-center justify-center gap-3 border-t border-slate-800 p-4">{!joined ? <button type="button" onClick={joinRoom} className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold hover:bg-teal-600"><Video size={18} /> Join assessment</button> : <><button type="button" onClick={() => toggleTrack("audio")} aria-label="Toggle microphone" className="rounded-full bg-slate-700 p-3 hover:bg-slate-600">{microphoneEnabled ? <Mic size={19} /> : <MicOff size={19} />}</button><button type="button" onClick={() => toggleTrack("video")} aria-label="Toggle camera" className="rounded-full bg-slate-700 p-3 hover:bg-slate-600">{cameraEnabled ? <Camera size={19} /> : <CameraOff size={19} />}</button><button type="button" onClick={leaveRoom} className="rounded-full bg-rose-700 p-3 hover:bg-rose-600" aria-label="Leave assessment"><PhoneOff size={19} /></button></>}</div></div><aside className="rounded-lg bg-white p-5 text-slate-900"><h2 className="font-bold">Visit details</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assessment clinician</dt><dd className="mt-1 font-medium">{physicianName}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</dt><dd className="mt-1 font-medium">{patientName}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visit type</dt><dd className="mt-1 font-medium">Preoperative assessment</dd></div></dl><p className="mt-6 rounded-lg bg-teal-50 p-3 text-xs leading-5 text-teal-900">This browser-based room keeps your assessment inside GetPreOp. Confirm your camera and audio are working before you join.</p>{notice ? <p className="mt-3 text-xs font-medium text-rose-700">{notice}</p> : null}</aside></div></section></main>;
}
