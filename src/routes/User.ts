import express from 'express';
import { loginLifeStyleController, mintingController, mnemonicLoginController, registerController, stakingController, stepToTokenController } from '../controllers/User';
import { transferByAddressController, transferByIdController, findAllUserController } from '../controllers/User';
import { auth } from '../middlewares/userAuthorization';
const router = express.Router();

router.post('/login/lifestyle', loginLifeStyleController);
router.post('/login/wallet', mnemonicLoginController);
router.post('/register', registerController);
router.post('/transfer/wallet/:id', auth, transferByAddressController);
router.post('/transfer/id/:id', auth, transferByIdController);
router.post('/minting', auth, mintingController);
router.get('/stepToToken', auth, stepToTokenController);
router.get('/staking', auth, stakingController);
router.get('/:id', auth, findAllUserController)
// router.get('/:id', auth, findALlUserController)

module.exports = router ;
