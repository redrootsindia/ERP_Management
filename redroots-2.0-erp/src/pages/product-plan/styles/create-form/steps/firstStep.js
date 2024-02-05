import React from 'react'
import { Button } from 'antd'

const FirstStep = ({ disabledNextCallback, secondStepCallBack }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-lg-12">
              <h5 className="mb-2 text-center">
                <strong>Choose One Option </strong>
              </h5>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-2" />
            <div className="col-lg-8">
              <div className="row">
                <div className="col-4 text-center">
                  <Button
                    onClick={() => {
                      if (disabledNextCallback) disabledNextCallback()
                      if (secondStepCallBack) secondStepCallBack('Transfer')
                    }}
                  >
                    Transfer New
                  </Button>
                </div>
                <div className="col-4 text-center">
                  <Button
                    onClick={() => {
                      if (disabledNextCallback) disabledNextCallback()
                      if (secondStepCallBack) secondStepCallBack('Existing')
                    }}
                  >
                    Add from existing
                  </Button>
                </div>
                <div className="col-4 text-center">
                  <Button
                    onClick={() => {
                      if (disabledNextCallback) disabledNextCallback()
                    }}
                  >
                    Create New
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-lg-2" />
          </div>
        </div>
      </div>
    </>
  )
}

export default FirstStep
