import { Outlet, Navigate } from "react-router-dom"

const AuthLayout = () => {
  const isAuthinticated = false;

  return (
    <>
      {isAuthinticated ? (
        <Navigate to="/" />
      ): (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img 
            src="/assets/images/side-img.svg"
            alt="signup banner"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  )
}

export default AuthLayout