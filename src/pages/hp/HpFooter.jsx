const currentDate = new Date();
const year = currentDate.getFullYear();

function HpFooter() {
  return (
    <>
     <div className="db-footer-area bg-white round-5 p-2">
        <p className="fs-13 copyright-text text-center mb-0">
          <i className="ri-copyright-line"></i>
          <span className="text_primary fw-medium">{year} {import.meta.env.VITE_COMPANY_NAME}</span>. All rights Reserved.
        </p>
      </div>
    </>
  )
}

export default HpFooter