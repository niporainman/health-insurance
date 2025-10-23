function HmoHeader({ page_title }) {  
    document.title = `${page_title} | ${import.meta.env.VITE_COMPANY_NAME}`;
  return (
    <>
        <div className="db-breadcrumb-area">
            <div className="row align-items-center">
                <div className="col-md-5 mb-sm-10">
                    <h6 className="fs-17 fw-bold mb-0">{page_title}</h6>
                </div>
                <div className="col-md-7">
                    <ul className="db-breadcrumb-menu list-unstyled mb-0 text-md-end">
                    <li>{page_title}</li>
                    </ul>
                </div>
            </div>
        </div>
    </>
  )
}

export default HmoHeader