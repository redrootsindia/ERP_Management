import React, { useState, useEffect } from 'react'
import { Comment, Image, Button } from 'antd'
import _ from 'lodash'
import FileUpload from 'components/FileUpload'
import moment from 'moment'
import { useQuery } from '@apollo/client'
import { COMMENTS_LIST } from './queries'

const Comments = ({ ticket_id, refreshComments, refreshCommentsCallback }) => {
  const [commentsList, setCommentsList] = useState([])

  const {
    loading: commentLoad,
    error: commentErr,
    data: commentData,
    refetch,
  } = useQuery(COMMENTS_LIST, {
    variables: { ticket_id },
  })

  useEffect(() => {
    if (
      !commentLoad &&
      commentData &&
      commentData.commentsList &&
      commentData.commentsList.length
    ) {
      setCommentsList(commentData.commentsList.map((obj) => ({ ...obj, readMore: false })))
    } else {
      setCommentsList([])
    }
    if (refreshCommentsCallback) refreshCommentsCallback()
  }, [commentData, commentLoad])

  if (refreshComments) refetch()

  if (commentErr) return `Error occured while fetching data: ${commentErr.message}`

  return (
    <>
      {commentsList && commentsList.length
        ? commentsList.map((obj) => (
            <>
              <div className="card" key={obj.id}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-8">
                      <Comment
                        author={<b>{obj.name}</b>}
                        datetime={
                          obj.createdAt
                            ? moment(Number(obj.createdAt)).format('Do MMM YYYY, h:mm A')
                            : '-'
                        }
                        avatar={
                          <Image
                            src={
                              process.env.REACT_APP_IMAGE_URL +
                              process.env.REACT_APP_PROFILE_PIC_URL +
                              obj.profile_pic
                            }
                            alt="profile"
                            fallback="resources/images/placeholder/profile.png"
                            preview={false}
                          />
                        }
                        content={
                          <p>
                            {obj.readMore
                              ? obj.text
                              : String(obj.text).length > 200
                              ? `${obj.text.substring(0, 200)}...`
                              : obj.text}
                          </p>
                        }
                      />
                      {String(obj.text).length > 200 ? (
                        <Button
                          type="primary"
                          onClick={() => {
                            const intermediateData = _.cloneDeep(commentsList)
                            intermediateData.forEach((row) => {
                              if (row.id === obj.id) {
                                console.log('row', row)
                                if (obj.readMore) {
                                  row.readMore = false
                                } else {
                                  row.readMore = true
                                }
                              }
                            })
                            setCommentsList(intermediateData)
                          }}
                        >
                          {obj.readMore ? 'show less' : '  read more'}
                        </Button>
                      ) : null}
                    </div>
                    <div className="col-3">
                      <div className="row">
                        {obj.files && obj.files.length ? (
                          <FileUpload
                            existingFileNames={obj.files} // Always pass an array. If not empty, it should have names of files, without URL
                            prependURL={
                              process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_TICKET_URL
                            }
                            placeholderType="general"
                            maxFiles={10}
                            editMode
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))
        : null}
    </>
  )
}

export default Comments
