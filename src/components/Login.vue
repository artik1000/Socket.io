<template>
    <div class="div">
        <div class="login-wripper">
            <div class="title">Выберите Аватар</div>
            <div class="inner">
                <Icon @click="left" class="left" type="md-arrow-round-back" />
                <Avatar class="avatar" shape="square" size="large" :src="myAvatar"/>
                <Icon @click="right" class="right" type="md-arrow-round-forward" />
                <Modal title="Error" v-model="errDisplay" :styles="{top: '80px',width: '200px'}">
                    <p>Ошибка</p>
                </Modal>
                <Input @on-enter="login" v-model="name" class="input" size="large" placeholder="Введите логин" />
                <div class="tip" v-show="visible">
                    <div class="tip-inner">Введите логин!</div>
                    <div class="tip-inner2"></div>
                </div>
                <Button @click="login" class="button" type="success">Login</Button>
            </div>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client'

const ERROR = 0

export default {
    name: 'Login',
    data() {
        return {
            name: '',
            avatar: ['avatar1', 'avatar2', 'avatar3'],
            avatarNum: 0,
            visible: false,
            errDisplay: false
        }
    },
    computed: {
        myAvatar(){
            return require(`@/assets/images/${this.avatar[this.avatarNum]}.jpeg`)
        },
        mySocket(){
            return this.$store.socket
        }
    },
    methods: {
        login(){
            if(!this.name){
                this.visible = true
                setTimeout(() => {
                    this.visible = false
                }, 2000);
                return
            }
            this.mySocket.emit('login', {
                name: this.name,
                avatar: this.avatar[this.avatarNum]
            })
            
            this.mySocket.on('loginStatus', (state) => {
                if(state){
                    this.$router.push({
                        path: '/chat',
                        name: 'Chat',
                        params: {
                            name: this.name,
                            avatar: this.avatar[this.avatarNum]
                        }
                    })
                }else{
                    this.errDisplay = true
                }
            })
        },
        left(){
            if(!this.avatarNum){
                this.avatarNum = 14
            }else{
                this.avatarNum = this.avatarNum - 1
            }
        },
        right(){
            if(this.avatarNum === 14){
                this.avatarNum = 0
            }else{
                this.avatarNum = this.avatarNum + 1
            }
        }
    },
    mounted(){
        //this.$store.socket = io('http://localhost:9999/')
        this.$store.socket = io('/')
    }
}
</script>

<style lang="stylus">
    *
        box-sizing border-box
    .div
        .login-wripper
            -webkit-user-select:none; 
            -moz-user-select:none; 
            -ms-user-select:none; 
            user-select:none;
            width 350px
            height 500px
            background: rgb(131,58,180)
            background: linear-gradient(135deg, rgba(131,58,180,1) 0%, rgba(29,50,253,1) 50%, rgba(69,188,252,1) 100%)
            border-radius 10px
            box-shadow 0 0 10px #999
            position absolute
            top 50%
            left 50%
            margin -250px 0 0 -175px
            .title
                font-size 20px
                color white
                text-align center
                padding 18px
            .inner
                padding 50px
                .left
                    display inline-block
                    font-size 28px
                    margin-right 35px
                .avatar
                    display inline-block
                    width 110px
                    height 110px
                .right 
                    display inline-block
                    font-size 28px
                    margin-left 35px
                .input
                    margin-top 60px
                .tip
                    position absolute
                    top 235px
                    right 50px
                    font-size 12px
                    width 150px
                    height 30px
                    .tip-inner
                        display block
                        background white
                        color red
                        border-radius 10px
                        padding 10px 15px
                    .tip-inner2
                        display block
                        width 0px
                        height 0px
                        border-top 10px solid #ddd
                        border-bottom 10px solid transparent
                        border-right 10px solid transparent
                        border-left 10px solid transparent
                        margin-left 90px
                        border-radius 2px
                .button
                    border: 2px solid blue
                    border-radius: 10px
                    background: white
                    color: blue
                    font-weight: bold
                    font-size 16px
                    height 40px
                    width 100%
                    margin-top 20px
</style>