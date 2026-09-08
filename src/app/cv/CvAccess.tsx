"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { unlockCv } from "./actions";
import { PrintButton } from "./PrintButton";
import styles from "./cv.module.css";

export function CvAccess() {
  const [cv, setCv] = useState<Awaited<ReturnType<typeof unlockCv>>>(null);
  const [invalid, setInvalid] = useState(false);
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function submit(formData: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    try {
      const result = await unlockCv(formData.get("password"));
      setCv(result);
      setInvalid(result === null);
    } catch {
      setInvalid(true);
    } finally {
      setPassword("");
      setPending(false);
      submitting.current = false;
    }
  }

  if (cv) {
    return (
      <div className={styles.page}>
        <div className={styles.toolbar}><PrintButton /></div>
        <article className={`${styles.sheet} ${styles.content}`} aria-label="여채현 이력서">
          <header className={styles.profile}>
            <MarkdownContent html={cv.profileHtml} className={styles.profileDetails} />
            {/* eslint-disable-next-line @next/next/no-img-element -- Private portrait is embedded in this authenticated response. */}
            <img src={cv.photo} alt="여채현 증명사진" className={styles.portrait} />
          </header>
          <MarkdownContent html={cv.bodyHtml} className={styles.body} />
        </article>
      </div>
    );
  }

  return (
    <section className={styles.login} aria-labelledby="cv-login-title">
      <h1 id="cv-login-title">서류 열람 비밀번호 확인</h1>
      <p id="cv-login-hint" className={styles.loginHint}>6자리 비밀번호를 {invalid ? "다시 한 번 " : ""}입력해 주세요.</p>
      <form action={submit} className={styles.loginForm}>
        <label htmlFor="cv-password" className="sr-only">비밀번호</label>
        <div className={styles.passwordField}>
          <input id="cv-password" name="password" type="password" autoComplete="current-password" required minLength={6} maxLength={6}
            inputMode="numeric" pattern="[0-9]{6}" enterKeyHint="done" autoFocus
            value={password} onChange={(event) => {
              const input = event.currentTarget;
              input.value = input.value.replace(/\D/g, "").slice(0, 6);
              setPassword(input.value);
              setInvalid(false);
              if (input.value.length === 6) input.form?.requestSubmit();
            }}
            spellCheck={false} readOnly={pending}
            aria-invalid={invalid || undefined} aria-describedby={invalid ? "cv-login-hint cv-login-error" : "cv-login-hint"}
            className={styles.passwordInput} />
          <div className={styles.passwordDots} aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className={styles.passwordDot} data-filled={index < password.length} />
            ))}
          </div>
        </div>
        {invalid && <p id="cv-login-error" role="alert" className="text-sm text-red-600">비밀번호를 확인하고 다시 시도해 주세요.</p>}
        <button type="submit" className={styles.loginSubmit} disabled={pending} aria-busy={pending}>{pending ? "확인 중…" : "확인"}</button>
      </form>
    </section>
  );
}
