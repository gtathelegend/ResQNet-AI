"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { ResourceItem } from "@/types/resource";
import { Incident } from "@/types/incident";

interface AllocateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inventory: ResourceItem[];
  activeIncidents: Incident[];
}

export function AllocateResourceModal({
  isOpen,
  onClose,
  onSuccess,
  inventory,
  activeIncidents,
}: AllocateResourceModalProps) {
  const { user } = useAuth();

  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiJustification, setAiJustification] = useState("");

  const selectedResource = inventory.find((r) => r.id === selectedResourceId);
  const selectedIncident = activeIncidents.find(
    (i) => i.id === selectedIncidentId
  );

  // Trigger Gemini AI Advisor allocation recommendation
  const handleAIRecommend = async () => {
    if (!selectedIncidentId) {
      toast.warning("Select Incident First", {
        description: "Choose an active incident to run the AI Advisor.",
      });
      return;
    }

    setAiLoading(true);
    setAiJustification("");
    try {
      const response = await fetch("/api/recommend-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: selectedIncident?.type,
          severity: selectedIncident?.severity,
          peopleAffected: selectedIncident?.peopleAffected,
          medicalEmergency: selectedIncident?.medicalEmergency,
          waterNeeded: selectedIncident?.waterNeeded,
          foodNeeded: selectedIncident?.foodNeeded,
          shelterNeeded: selectedIncident?.shelterNeeded,
          inventory,
        }),
      });

      if (!response.ok) {
        throw new Error("AI Advisor failed.");
      }

      const data = await response.json();

      if (data.allocations && data.allocations.length > 0) {
        const firstRecommendation = data.allocations[0];
        const matchingItem = inventory.find(
          (i) => i.name.toLowerCase() === firstRecommendation.name.toLowerCase()
        );

        if (matchingItem) {
          setSelectedResourceId(matchingItem.id);
          setQuantity(firstRecommendation.quantity);
          setNote(data.justification || "AI suggested allocation.");
          setAiJustification(data.justification);
          toast.success("AI Recommendation Loaded", {
            description: `Suggested ${firstRecommendation.quantity} ${matchingItem.unit} for ${firstRecommendation.name}.`,
          });
        }
      } else {
        toast.info("No Recommendations Required", {
          description:
            "Gemini reports that current incident parameters require no additional resources.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Advisor Error", {
        description: "Could not fetch AI allocations.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedIncident || !selectedResource) return;

    if (quantity <= 0) {
      toast.error("Invalid Quantity", {
        description: "Quantity must be greater than zero.",
      });
      return;
    }

    if (quantity > selectedResource.availableStock) {
      toast.error("Stock Shortage", {
        description: `Only ${selectedResource.availableStock} ${selectedResource.unit} available in stock.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert new Allocation record
      const allocation = {
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        incidentId: selectedIncident.id,
        incidentType: selectedIncident.type,
        quantity,
        status: "staged",
        allocatedBy: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allocResult = await supabase
        .from("resource_allocations")
        .insert(allocation);
      if (allocResult.error) throw new Error(allocResult.error.message);

      // 2. Update Resource Stock Levels
      const newAllocStock = selectedResource.allocatedStock + quantity;
      const newAvailStock = selectedResource.totalStock - newAllocStock;

      const resResult = await supabase
        .from("resources")
        .update({
          allocatedStock: newAllocStock,
          availableStock: newAvailStock,
        })
        .eq("id", selectedResource.id)
        .single();
      if (resResult.error) throw new Error(resResult.error.message);

      // 3. Insert History Log
      const historyLog = {
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        action: "allocate",
        quantity,
        performedBy: user.email,
        createdAt: new Date().toISOString(),
        note:
          note ||
          `Allocated to ${selectedIncident.type} at ${selectedIncident.location}`,
      };

      const histResult = await supabase
        .from("resource_history")
        .insert(historyLog);
      if (histResult.error) throw new Error(histResult.error.message);

      toast.success("Resources Allocated Successfully", {
        description: `${quantity} ${selectedResource.unit} are staged for Sector dispatch.`,
      });

      // Reset form fields
      setSelectedIncidentId("");
      setSelectedResourceId("");
      setQuantity(0);
      setNote("");
      setAiJustification("");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database save failure.";
      toast.error("Allocation Failed", { description: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Resource Allocation"
      description="Deploy inventory stock directly to active disaster incidents."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Incident Selection with AI Sparkle trigger */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Active Incident Location
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
                    <span>Gemini AI Advisor</span>
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
            <option value="">Select Incident Staging Area...</option>
            {activeIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.location} ({inc.type.toUpperCase()} -{" "}
                {inc.severity.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Selection */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
            Select Resource Item
          </label>
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
            required
          >
            <option value="">Choose Stock Category...</option>
            {inventory.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name} (Stock: {res.availableStock} {res.unit} / Depot:{" "}
                {res.depot})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Field */}
        {selectedResource && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Allocation Quantity ({selectedResource.unit})
              </label>
              <span className="text-muted-foreground text-[10px]">
                Max Stock: <strong>{selectedResource.availableStock}</strong>{" "}
                Available
              </span>
            </div>
            <input
              type="number"
              value={quantity || ""}
              onChange={(e) =>
                setQuantity(Math.max(0, parseInt(e.target.value) || 0))
              }
              placeholder={`Enter quantity up to ${selectedResource.availableStock}`}
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
              max={selectedResource.availableStock}
              min={1}
              required
            />
          </div>
        )}

        {/* AI Justification Display */}
        {aiJustification && (
          <div className="bg-primary/5 border-primary/10 text-primary flex gap-2 rounded-lg border p-3 font-sans text-xs leading-relaxed italic">
            <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <strong className="block font-semibold not-italic">
                Gemini AI Justification:
              </strong>
              <p>{aiJustification}</p>
            </div>
          </div>
        )}

        {/* Dispatch Notes */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
            Dispatch Staging Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Specify staging locations, transport guidelines, or delivery priorities..."
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
            rows={2.5}
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
            disabled={submitting || !selectedResourceId || !selectedIncidentId}
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Staging...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>Stage Allocation</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
