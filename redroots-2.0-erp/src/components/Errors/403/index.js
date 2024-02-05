import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'antd'

const Error403 = () => {
  const history = useHistory()
  return (
    <div className="container pl-5 pr-5 pt-5 pb-5 mb-auto text-dark font-size-32">
      <div className="font-weight-bold mb-3">Permission denied</div>
      <div className="text-gray-6 font-size-24">
        You do not have permissions to view this page. If you believe otherwise, try logging-in
        again. Or else, contact the system administrator.
      </div>
      <div className="font-weight-bold font-size-70 mb-1">403 —</div>
      <Button className="btn btn-outline-primary width-100" onClick={() => history.goBack()}>
        Go Back
      </Button>
    </div>
  )
}

export default Error403
