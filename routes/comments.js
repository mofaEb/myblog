const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

router.post('/', checkLogin, (req, res, next) => {
  const { postId, content } = req.fields
  const author = req.session.user._id

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写留言内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author,
    postId,
    content
  }

  CommentModel.create(comment)
    .then(() => {
      req.flash('success', '留言成功')
      res.redirect('back')
    })
    .catch(next)
})

router.get('/:commentId/remove', checkLogin, (req, res, next) => {
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then((comment) => {
      if (!comment) {
        throw new Error('留言不存在')
      }
      if (comment.author.toString() !== author.toString()) {
        throw new Error('没有权限删除留言')
      }
      CommentModel.delCommentById(commentId)
        .then(() => {
          req.flash('success', '删除留言成功')
          // 删除成功后跳转到上一页
          res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router
