import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const C = { primary: "#2E7D32", teal: "#00897b", muted: "#5a7a65", border: "#e0f2f1" };

export default function ReschedulePage() {
  const { token } = useParams();
  // loading | found | notfound | requesting | requested
  // | options | confirming | confirmed | error
  const [status, setStatus] = useState("loading");
  const [appointment, setAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedDate, setConfirmedDate] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/public/appointments/${token}`);
        if (!res.ok) { setStatus("notfound"); return; }
        const data = await res.json();
        setAppointment(data);
        if (data.appointment_status === "options_sent") {
          setStatus("options");
        } else if (data.appointment_status === "reschedule_requested") {
          setStatus("requested");
        } else {
          setStatus("found");
        }
      } catch {
        setStatus("error");
      }
    };
    fetchAppointment();
  }, [token]);

  const handleRequestReschedule = async () => {
    setStatus("requesting");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/public/appointments/${token}/reschedule-request`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("requested");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleSelectOption = async (option) => {
    setStatus("confirming");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/public/appointments/${token}/select-option`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ option }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setConfirmedDate(data.appointmentDate);
      setStatus("confirmed");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" }) : "";

  const optionBtnStyle = {
  padding: "14px 18px", borderRadius: 12,
  border: `1.5px solid #a5d6a7`, background: "#e8f5e9",
  color: "#1b5e20", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
};
const optionLabelStyle = {
  fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", opacity: 0.7, marginBottom: 4,
};

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f0fdf5", fontFamily: "Montserrat, sans-serif", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px",
        width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.1)",
        border: `1px solid rgba(0,168,76,0.15)`, textAlign: "center",
      }}>
        {status === "loading" && (
          <>
            <Loader2 size={32} color={C.teal} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 16, color: C.muted }}>Loading your appointment…</p>
          </>
        )}

        {status === "notfound" && (
          <>
            <XCircle size={40} color="#dc2626" />
            <h2 style={{ marginTop: 16, color: "#0d2b1e" }}>Link Invalid or Expired</h2>
            <p style={{ color: C.muted, fontSize: 14 }}>
              This link is no longer valid. Please contact us directly if you need help.
            </p>
          </>
        )}

        {status === "found" && appointment && (
          <>
            <CalendarClock size={36} color={C.teal} />
            <h2 style={{ marginTop: 16, marginBottom: 4, color: "#0d2b1e" }}>Your Interview</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Hi {appointment.name},</p>
            <div style={{ background: "#f0fdf5", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", marginBottom: 4 }}>
                Scheduled Date & Time
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0d2b1e" }}>
                {fmt(appointment.appointment_date)}
              </div>
              {appointment.appointment_location && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", marginTop: 12, marginBottom: 4 }}>
                    Location / Mode
                  </div>
                  <div style={{ fontSize: 14, color: "#0d2b1e" }}>{appointment.appointment_location}</div>
                </>
              )}
            </div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              Can't make it? Let us know and we'll send you two new time options to choose from.
            </p>
            <button
              onClick={handleRequestReschedule}
              style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel / Request Reschedule
            </button>
          </>
        )}

        {status === "requesting" && (
          <>
            <Loader2 size={32} color={C.teal} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 16, color: C.muted }}>Submitting your request…</p>
          </>
        )}

        {status === "requested" && (
          <>
            <CheckCircle2 size={40} color={C.primary} />
            <h2 style={{ marginTop: 16, color: "#0d2b1e" }}>Request Received</h2>
            <p style={{ color: C.muted, fontSize: 14 }}>
              We've let the admin know. You'll get an email shortly with two new time options to pick from.
            </p>
          </>
        )}

        {status === "options" && appointment && (
        <>
            <CalendarClock size={36} color={C.teal} />
            <h2 style={{ marginTop: 16, marginBottom: 4, color: "#0d2b1e" }}>Choose Your Interview Time</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
            Hi {appointment.name}, please pick one of the times below:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
            {appointment.reschedule_option_a && (
                <button onClick={() => handleSelectOption("a")} style={optionBtnStyle}>
                <div style={optionLabelStyle}>OPTION A</div>
                {fmt(appointment.reschedule_option_a)}
                </button>
            )}
            {appointment.reschedule_option_b && (
                <button onClick={() => handleSelectOption("b")} style={optionBtnStyle}>
                <div style={optionLabelStyle}>OPTION B</div>
                {fmt(appointment.reschedule_option_b)}
                </button>
            )}
            {appointment.reschedule_option_c && (
                <button onClick={() => handleSelectOption("c")} style={optionBtnStyle}>
                <div style={optionLabelStyle}>OPTION C</div>
                {fmt(appointment.reschedule_option_c)}
                </button>
            )}
            </div>
        </>
        )}

        {status === "confirming" && (
          <>
            <Loader2 size={32} color={C.teal} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 16, color: C.muted }}>Confirming your selection…</p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <CheckCircle2 size={40} color={C.primary} />
            <h2 style={{ marginTop: 16, color: "#0d2b1e" }}>You're All Set!</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 4 }}>
              Your interview is confirmed for:
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0d2b1e" }}>
              {fmt(confirmedDate)}
            </p>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 16 }}>
              A calendar invite has been sent to your email.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={40} color="#dc2626" />
            <h2 style={{ marginTop: 16, color: "#0d2b1e" }}>Something Went Wrong</h2>
            <p style={{ color: C.muted, fontSize: 14 }}>{errorMsg || "Please try again later."}</p>
          </>
        )}
      </div>
    </div>
  );
}