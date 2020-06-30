const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');

// @route    /api/posts/comments
// @access   Private

//comments of a particular post
router.get('/:id',(req,res) => {
    try {
        connection.query( ` SELECT
                                    comments.id, post_id, comments.user_id, username, comments.body, comments.created_at 
                                    FROM comments 
                                    JOIN posts ON posts.id = comments.post_id 
                                    JOIN users ON users.id = comments.user_id 
                                    WHERE post_id = ${req.params.id};`,
            (err, results) => {
            if (err) throw err;
            if (results.length === 0){
                return res.status(400).json({ msg: 'There are no comments for this post' });
            } else {
                return res.json(results);
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Server Error');
    }
});

//add comment to post
router.post(
    '/:id',
    [
        auth,
        [
            check('body','body is required')
                .not()
                .isEmpty()
        ]
    ], (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            try {
                connection.query(
                    'INSERT INTO comments(body,user_id,post_id) VALUES(?,?,?);'
                    , [req.body.body, req.user.id, req.params.id ] ,
                    (err,results) => {
                        if (err) throw err;
                        return res.json({ msg: 'Comment Added Successfully' });
                    });
            } catch (err) {
                console.log(err);
                return res.status(500).send('Server Error');
            }

        }
    });

//DELETE ROUTE
router.delete('/:id', auth , (req,res) => {
    try {
        connection.query('SELECT user_id FROM comments WHERE id = ?;',
            [req.params.id] ,
            (err, results) => {
            if (err) throw err;
            if (results[0].user_id !== req.user.id ){
                return res.status(401).json({ msg: 'User not authorized to delete' });
            } else {
                connection.query("DELETE FROM comments WHERE id = ?;", [req.params.id], (err, results) => {
                    if (err) throw err;
                    return res.json({ msg: 'Comment Deleted' });
                });
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Server Error');
    }
});



module.exports = router;