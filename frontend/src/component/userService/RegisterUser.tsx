// src/components/userService/RegisterUser.tsx
import React, { useState, useEffect } from 'react';
import styles from '@/styles/userService/Signup.module.css';
import { useForm } from "react-hook-form";
import { UserDTO } from "@/types/userService/user";
import { signup, checkUserSignId, checkEmail, checkNickName } from "@/api/userService/user";
import { useRouter } from "next/router";

type FormData = UserDTO & { passwordConfirm: string };

export default function RegisterUser() {
  const { register, handleSubmit, watch, formState: { errors, isValid }, setError, clearErrors, reset } = useForm<FormData>({ mode: "onChange" });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const passwordValue = watch("password");
  const userSignIdValue = watch("userSignId");
  const emailValue = watch("email");
  const nickNameValue = watch("nickName");

  const [idStatus, setIdStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [nickStatus, setNickStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // 아이디 중복 체크
  useEffect(() => {
    if (!userSignIdValue || userSignIdValue.length < 4) { setIdStatus("idle"); return; }
    const t = setTimeout(async () => {
      setIdStatus("checking");
      try {
        const res = await checkUserSignId(userSignIdValue);
        console.log("아이디 체크 결과:", res);
        setIdStatus(res.available ? "available" : "taken");
        console.log(res);
        res.available ? clearErrors("userSignId") : setError("userSignId", { type: "manual", message: "이미 사용 중인 아이디예요" });
      } catch { setIdStatus("taken"); }
    }, 500);
    return () => clearTimeout(t);
  }, [userSignIdValue]);

  // 이메일 중복 체크
  useEffect(() => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailStatus("idle");
      return;
    }
    const t = setTimeout(async () => {
      setEmailStatus("checking");
      try {
        const res = await checkEmail(emailValue);
        console.log("이메일 체크 결과:", res);   // ← 여기만 이렇게!

        setEmailStatus(res.available ? "available" : "taken");
        res.available ? clearErrors("email") : setError("email", { type: "manual", message: "이미 가입된 이메일이에요" });
      } catch {
        setEmailStatus("taken");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [emailValue, clearErrors, setError]);

// 닉네임 중복 체크
  useEffect(() => {
    if (!nickNameValue || nickNameValue.length < 2) {
      setNickStatus("idle");
      return;
    }
    const t = setTimeout(async () => {
      setNickStatus("checking");
      try {
        const res = await checkNickName(nickNameValue);
        console.log("닉네임 체크 결과:", res);   // ← 여기만 이렇게!

        setNickStatus(res.available ? "available" : "taken");
        res.available ? clearErrors("nickName") : setError("nickName", { type: "manual", message: "이미 사용 중인 닉네임이에요" });
      } catch {
        setNickStatus("taken");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [nickNameValue, clearErrors, setError]);

  const allValid = isValid && idStatus === "available" && emailStatus === "available" && nickStatus === "available";

  const onSubmit = async (data: FormData) => {
    if (!allValid) return;
    setIsSubmitting(true);
    setServerError("");
    try {
      const { passwordConfirm, ...userData } = data;
      const res = await signup(userData as UserDTO);
      if (res.success) {
        alert("회원가입 완료! Momentoryへ 오신 걸 환영합니다");
        reset();
        router.push("/");
      } else {
        setServerError(res.message || "회원가입에 실패했어요");
      }
    } catch {
      setServerError("서버에 문제가 있어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: typeof idStatus) => {
    if (status === "checking") return "검사 중";
    if (status === "available") return "사용 가능";
    if (status === "taken") return "사용 불가";
    return null;
  };

  return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Momentory</h1>
          <p className={styles.subtitle}>오늘의 순간, 영원히 간직하다</p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>

            {/* 아이디 */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>아이디</label>
              <div className={styles.inputWithStatus}>
                <input
                    {...register("userSignId", {
                      required: "필수 입력이에요",
                      minLength: { value: 4, message: "4자 이상 입력해 주세요" }
                    })}
                    placeholder="4~20자 영문+숫자"
                    className={`${styles.input} ${errors.userSignId ? styles.errorInput : ''}`}
                />
                {idStatus !== "idle" && (
                    <span className={`${styles.status} ${styles[idStatus]}`}>
                  {getStatusIcon(idStatus)}
                </span>
                )}
              </div>
              {errors.userSignId && <p className={styles.errorText}>{errors.userSignId.message}</p>}
            </div>

            {/* 이메일 */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>이메일</label>
              <div className={styles.inputWithStatus}>
                <input
                    {...register("email", {
                      required: "필수 입력이에요",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "이메일 형식이 아니에요" }
                    })}
                    type="email"
                    placeholder="example@naver.com"
                    className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                />
                {emailStatus !== "idle" && (
                    <span className={`${styles.status} ${styles[emailStatus]}`}>
                  {getStatusIcon(emailStatus)}
                </span>
                )}
              </div>
              {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
            </div>

            <div className={styles.row}>
              {/* 이름 */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>이름</label>
                <input
                    {...register("userName", {
                      required: "이름을 입력해 주세요",
                      pattern: { value: /^[가-힣a-zA-Z\s]+$/, message: "이름을 입력해주세요" }
                    })}
                    placeholder="홍길동"
                    className={`${styles.input} ${errors.userName ? styles.errorInput : ''}`}
                />
                {errors.userName && <p className={styles.errorText}>{errors.userName.message}</p>}
              </div>

              {/* 닉네임 */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>닉네임</label>
                <div className={styles.inputWithStatus}>
                  <input
                      {...register("nickName", {
                        required: "닉네임을 입력해 주세요",
                        minLength: { value: 2, message: "2자 이상 입력해 주세요" }
                      })}
                      placeholder="모멘토리안"
                      className={`${styles.input} ${errors.nickName ? styles.errorInput : ''}`}
                  />
                  {nickStatus !== "idle" && (
                      <span className={`${styles.status} ${styles[nickStatus]}`}>
                    {getStatusIcon(nickStatus)}
                  </span>
                  )}
                </div>
                {errors.nickName && <p className={styles.errorText}>{errors.nickName.message}</p>}
              </div>
            </div>

            <div className={styles.row}>
              {/* 비밀번호 */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>비밀번호</label>
                <input
                    {...register("password", {
                      required: "비밀번호를 입력해 주세요",
                      minLength: { value: 8, message: "8자 이상 입력해 주세요" }
                    })}
                    type="password"
                    placeholder="특수문자를 포함한 8자 이상"
                    className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                />
                {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>비밀번호 확인</label>
                <input
                    {...register("passwordConfirm", {
                      required: "확인해 주세요",
                      validate: v => v === passwordValue || "비밀번호가 달라요"
                    })}
                    type="password"
                    placeholder="비밀번호를 한번더 확인해요"
                    className={`${styles.input} ${errors.passwordConfirm ? styles.errorInput : ''}`}
                />
                {errors.passwordConfirm && <p className={styles.errorText}>{errors.passwordConfirm.message}</p>}
              </div>
            </div>

            {/* 프로필 이미지 */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                프로필 이미지 <span className={styles.optional}>(선택)</span>
              </label>
              <input
                  {...register("profile_img")}
                  placeholder="https://example.com/avatar.jpg"
                  className={styles.input}
              />
            </div>

            {serverError && <div className={styles.serverError}>{serverError}</div>}

            <button
                type="submit"
                disabled={isSubmitting || !allValid}
                className={styles.submitBtn}
            >
              {isSubmitting ? "가입 중..." : "지금 시작하기"}
            </button>
          </form>
        </div>
      </div>
  );
}