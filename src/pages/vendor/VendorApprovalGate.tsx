import React from "react";
import { Clock, XCircle, Zap } from "lucide-react";

interface Props {
  status: "pending" | "rejected";
}

const VendorApprovalGate: React.FC<Props> = ({ status }) => {
  const isPending = status === "pending";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              isPending ? "bg-role-vendor/10" : "bg-destructive/10"
            }`}
          >
            {isPending ? (
              <Clock className="h-10 w-10 text-role-vendor" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {isPending ? "Account Under Review" : "Application Rejected"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isPending
              ? "Your vendor account is under review. Once approved by our team, you will be able to start selling on SwiftLocal."
              : "Your vendor application was rejected. Please contact support for more information or to appeal the decision."}
          </p>
        </div>

        {/* Status chip */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border ${
            isPending
              ? "bg-role-vendor/10 text-role-vendor border-role-vendor/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isPending ? "bg-role-vendor animate-pulse" : "bg-destructive"}`} />
          {isPending ? "Pending Review" : "Rejected"}
        </div>

        {/* Info card */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-3">
          {isPending ? (
            <>
              <p className="text-sm font-semibold">What happens next?</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Our team reviews your business details",
                  "You'll gain access once approved",
                  "Typically reviewed within 1–2 business days",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-role-vendor/10 text-role-vendor text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Need help?</p>
              <p className="text-sm text-muted-foreground">
                Contact our support team at{" "}
                <a href="mailto:support@swiftlocal.com" className="text-brand hover:underline">
                  support@swiftlocal.com
                </a>{" "}
                with your registered email to learn more or submit an appeal.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Zap className="h-3.5 w-3.5" />
          <span>SwiftLocal Vendor Platform</span>
        </div>
      </div>
    </div>
  );
};

export default VendorApprovalGate;
