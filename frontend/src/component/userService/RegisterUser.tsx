// RegisterUser.tsx (최종 버전 - 디자인 완벽 적용)
import React, { useState } from 'react';
import styles from '../../styles/userService/Signup.module.css';
import { useForm } from "react-hook-form";
import { UserDTO } from "../../types/userService/user";
import { signup } from "../../api/userService/user";
import { useRouter } from "next/router";

export default function RegisterUser() {
  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<UserDTO & { passwordConfirm: string }>({ mode: "onChange" });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const passwordValue = watch("password");

  const onSubmit = async (data: UserDTO) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const response = await signup(data);
      if (response.success) {
        alert("✨ 회원가입이 완료되었습니다!");
        reset();
        router.push("/");
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, options }: any) => {
    const error = errors[name];
    return (
        <div className={styles.field}>
          <label className={styles.label}>{label}</label>
          <input
              {...register(name, options)}
              type={type}
              placeholder={error?.message || placeholder}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
          />
        </div>
    );
  };

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>Momentory</h1>
          <p className={styles.subTitle}>오늘의 순간, 영원히 간직하다</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <InputField label="아이디" name="userSignId" placeholder="아이디를 입력하세요" options={{ required: "아이디를 입력해주세요" }} />

          <InputField label="이메일" name="email" type="email" placeholder="example@momentory.com" options={{
            required: "이메일을 입력해주세요",
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "올바른 이메일 형식이 아닙니다" }
          }} />

          <div className={styles.fieldGroup}>
            <InputField label="이름" name="userName" placeholder="홍길동" options={{
              required: "이름을 입력해주세요", pattern: { value: /^[가-힣]+$/, message: "한글만 입력 가능합니다" }
            }} />
            <InputField label="닉네임" name="nickName" placeholder="모멘토리안" options={{ required: "닉네임을 입력해주세요" }} />
          </div>

          <div className={styles.fieldGroup}>
            <InputField label="비밀번호" name="password" type="password" placeholder="8자 이상" options={{
              required: "비밀번호를 입력해주세요",
              minLength: { value: 8, message: "8자 이상 입력해주세요" }
            }} />
            <InputField label="비밀번호 확인" name="passwordConfirm" type="password" placeholder="한번 더 입력" options={{
              required: "비밀번호 확인이 필요합니다",
              validate: v => v === passwordValue || "비밀번호가 일치하지 않습니다"
            }} />
          </div>

          <InputField label="프로필 이미지 (선택)" name="profile_img" placeholder="https://..." options={{}} />

          {serverError && <div className={styles.serverError}>⚠️ {serverError}</div>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || !isValid}>
            {isSubmitting ? "가입 중..." : "지금 시작하기"}
          </button>
        </form>
      </div>
  );
}