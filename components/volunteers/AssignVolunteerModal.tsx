"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { VolunteerProfile } from "@/types/volunteer";
import { Incident } from "@/types/incident";

interface AssignVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  volunteers: VolunteerProfile[];
  activeIncidents: Incident[];
}

export function AssignVolunteerModal({
  isOpen,
  onClose,
  onSuccess,
  volunteers,
  activeIncidents,
}: AssignVolunteerModalProps) {
  const { user } = useAuth();

  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiJustification, setAiJustification] = useState("");

  const selectedIncident = activeIncidents.find(
    (i) => i.id === selectedIncidentId
  );
  const selectedVolunteer = volunteers.find(
    (v) => v.id === selectedVolunteerId
  );

  // Trigger Gemini AI Advisor volunteer matching recommendation
  const handleAIRecommend = async () => {
    if (!selectedIncidentId) {
      toast.warning("Select Incident First", {
        description: "Choose an active incident to find matching volunteers.",
      });
      return;
    }

    setAiLoading(true);
    setAiJustification("");
    try {
      const response = await fetch("/api/recommend-volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: selectedIncident?.type,
          severity: selectedIncident?.severity,
          description: selectedIncident?.description,
          latitude: selectedIncident?.latitude,
          longitude: selectedIncident?.longitude,
          volunteers,
        }),
      });

      if (!response.ok) {
        throw new Error("AI Matcher failed.");
      }

      const data = await response.json();

      if (data.recommendations && data.recommendations.length > 0) {
        const bestRec = data.recommendations[0];

        setSelectedVolunteerId(bestRec.volunteerId);
        setRoleInput(bestRec.role);
        setAiJustification(bestRec.reason || data.justification);
        toast.success("AI Proximity Match Found", {
          description: `Suggested ${bestRec.volunteerName} for ${bestRec.role}.`,
        });
      } else {
        toast.info("No Matching Candidates", {
          description:
            data.justification ||
            "No available on-duty volunteers qualify for this incident profile.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Advisor Error", {
        description: "Could not fetch AI match recommendations.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedIncident || !selectedVolunteer) return;

    if (!roleInput.trim()) {
      toast.error("Role Required", {
        description: "Specify a dispatch role for this volunteer.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert new Volunteer Assignment record
      const assignment = {
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        incidentId: selectedIncident.id,
        incidentType: selectedIncident.type,
        incidentLocation: selectedIncident.location,
        role: roleInput.trim(),
        status: "assigned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const assignResult = await supabase
        .from("volunteer_assignments")
        .insert(assignment);
      if (assignResult.error) throw new Error(assignResult.error.message);

      // 2. Update Volunteer Profile Status to "assigned"
      const volResult = await supabase
        .from("volunteers")
        .update({ status: "assigned" })
        .eq("id", selectedVolunteer.id)
        .single();
      if (volResult.error) throw new Error(volResult.error.message);

      // 3. Append to Incident Timeline
      const timelineNote = `Assigned volunteer ${selectedVolunteer.name} as ${roleInput.trim()}.`;
      const currentHistory = selectedIncident.statusHistory || [];
      const updatedHistory = [
        ...currentHistory,
        {
          status: selectedIncident.status,
          updatedAt: new Date().toISOString(),
          updatedBy: user.fullName || user.email,
          note: timelineNote,
        },
      ];

      await supabase
        .from("incidents")
        .update({ statusHistory: updatedHistory })
        .eq("id", selectedIncident.id)
        .single();

      toast.success("Volunteer Dispatched Successfully", {
        description: `${selectedVolunteer.name} has been assigned to ${selectedIncident.location}.`,
      });

      // Reset form fields
      setSelectedIncidentId("");
      setSelectedVolunteerId("");
      setRoleInput("");
      setAiJustification("");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database write failure.";
      toast.error("Assignment Failed", { description: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Volunteer Deployment"
      description="Deploy available on-duty volunteers to active emergency locations."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Incident Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Active Staging Incident
            </label>
            {selectedIncidentId && (
              <button
                type="button"
                onClick={handleAIRecommend}
                disabled={aiLoading}
                className="text-primary hover:text-primary-dark bg-primary/5 border-primary/10 flex cursor-pointer items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold transition-colors"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="text-primary size-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="text-primary size-3 animate-pulse" />
                    <span>Gemini Matching Advisor</span>
                  </>
                )}
              </button>
            )}
          </div>
          <select
            value={selectedIncidentId}
            onChange={(e) => {
              setSelectedIncidentId(e.target.value);
              setAiJustification("");
            }}
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
            required
          >
            <option value="">Select Target Location...</option>
            {activeIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.location} ({inc.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Volunteer Selection */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
            Select On-Duty Volunteer
          </label>
          <select
            value={selectedVolunteerId}
            onChange={(e) => setSelectedVolunteerId(e.target.value)}
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
            required
          >
            <option value="">Choose Responder...</option>
            {volunteers.map((vol) => (
              <option key={vol.id} value={vol.id}>
                {vol.name} (Skills: {vol.skills.slice(0, 2).join(", ")} | Depot:{" "}
                {vol.locationName})
              </option>
            ))}
          </select>
        </div>

        {/* AI Justification Display */}
        {aiJustification && (
          <div className="bg-primary/5 border-primary/10 text-primary flex gap-2 rounded-lg border p-3 font-sans text-xs leading-relaxed italic">
            <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <strong className="block font-semibold not-italic">
                Gemini AI Proximity Match:
              </strong>
              <p>{aiJustification}</p>
            </div>
          </div>
        )}

        {/* Dispatch Role */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
            Assigned Deployment Role
          </label>
          <input
            type="text"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder="E.g. Medical First Responder, Evacuation Coordinator"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
            required
          />
        </div>

        {/* Action Controls */}
        <div className="border-border flex justify-end gap-2 border-t pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            className="gap-2"
            disabled={submitting || !selectedVolunteerId || !selectedIncidentId}
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>Confirm Dispatch</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
