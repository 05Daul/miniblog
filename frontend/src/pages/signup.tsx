import React from 'react';
import RegisterUser from '../component/userService/RegisterUser';
import Layout from "../component/layout/MainLayout";

// 만약 공통 레이아웃(헤더, 푸터 등)이 있다면 여기서 감싸줍니다.
// import Layout from '../components/Layout';

const SignupPage = () => {
  return (
      <Layout>
        <div className="signup-page-container">
          <RegisterUser/>
        </div>
      </Layout>
  );
};

export default SignupPage;