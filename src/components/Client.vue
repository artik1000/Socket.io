<template>
    <div class="div">
        <Layout class="client-wripper">
            <Sider class="sider1" style="min-width: 50px; max-width: 50px">
                <Avatar shape="square" :src="avatar('self')" />
                <Icon class="menu" type="ios-menu" />
            </Sider>
            <Sider class="sider2" style="min-width: 180px; max-width: 180px">
                <Layout class="sider2-wrapper">
                    <Header class="header">
                        <Input class="input" size="small" >
                            <Icon type="ios-search" slot="prefix" />
                        </Input>
                        <Icon class="add" type="ios-add" />
                    </Header>
                    <Content class="content">
                        <Menu class="menu" 
                            :active-name="currentName"
                            theme="dark" 
                            width="176px"
                            @on-select="selectName">
                            <MenuItem class="menu-item" v-for="(item, index) in person" :key="index" :name="item.name">
                                <Row class="row">
                                    <Col class="avatar" span="7">
                                        <Avatar style="width: 40px;height: 40px" shape="square" :src="avatar(item.name===self ? 'file' : item.avatar)"/>
                                    </Col>
                                    <Col class="infomation" span="12">
                                        <div class="name">{{item.name===self ? 'Отправить себе' : item.name}}</div>
                                        <div class="msg">{{msgs[item.name] ? msgs[item.name][msgs[item.name].length-1].msg : ''}}</div>
                                    </Col>
                                    <Col class="time" span="">
                                        <span>{{msgs[item.name] ? msgs[item.name][msgs[item.name].length-1].time : ''}}</span>
                                    </Col>
                                </Row>
                            </MenuItem>
                        </Menu>
                    </Content>
                </Layout>
            </Sider>
            <Layout class="content-wrapper">
                <Header class="header">
                    <span class="name">{{currentName}}</span>
                    <Icon @click="exit" class="close" type="ios-close" />
                </Header>
                <Content class="content" ref="content">
                    <Row type="flex" class="row" v-for="(item, index) in msgs[currentName]" :key="index" :class="{isSelf: item.sender===self}" :justify="item.sender===self ? 'end' : 'start'">
                        <Col :order="item.sender===self ? 2 : 1" class="avatar" span="2">
                            <Avatar style="width: 30px;height: 30px" shape="square" :src="avatar(item.avatar)" />
                        </Col>
                        <Col :order="item.sender===self ? 1 : 2" class="infomation" span="10">
                            <div class="name">{{item.sender}}</div>
                            <div class="msg">
                                <span class="span">{{item.msg}}</span>
                            </div>
                        </Col>
                    </Row>
                </Content>
                <Footer class="footer">
                    <Icon class="emotion" type="ios-happy-outline" />
                    <textarea @keydown.enter.prevent="send" v-model="sendMsg" class="textarea" cols="52" rows="3"></textarea>
                    <div class="tip" v-show="visible">
                        <div class="tip-inner">Введите сообщение</div>
                        <div class="tip-inner2"></div>
                    </div>
                    <button class="button" @click.prevent.stop="send">Отправить сообщение</button>
                </Footer>
            </Layout>
        </Layout>
    </div>
</template>

<script>
import io from 'socket.io-client'
function getDate(){
    let obj = new Date()
    return (obj.getHours()+'').padStart(2, '0')+':'+ (obj.getMinutes()+'').padStart(2, '0')
}
export default {
    name: 'Client',
    props: {
        
    },
    data() {
        return {
            currentName: 'Общий чат',
            self: '',
            myAvatar: 'avatar1',
            person: {
                'Общий чат': {
                    avatar: 'qunliao',
                    name: 'Общий чат'
                },
            },
            msgs: {},
            sendMsg: '',
            socket: '',
            visible: false,
        }
    },
    computed: {
        mySocket(){
            return this.$store.socket
        }
    },
    methods: {
        selectName(name){
            this.currentName = name
            let div = this.$refs.content.$el
            this.$nextTick(() => {
                div.scrollTop = div.scrollHeight
            })
        },
        avatar(avt){
            if(avt === 'self'){
                return require(`@/assets/images/${this.myAvatar}.jpeg`)
            }else{
                return require(`@/assets/images/${avt}.png`)
            }
        },
        send(){
            let currentTime = getDate()
            console.log(currentTime)
            if(!this.sendMsg){
                this.visible = true
                setTimeout(() => {
                    this.visible = false
                }, 2000);
                return 
            }
            let msg = {
                sender: this.self,
                receiver: this.currentName,
                msg: this.sendMsg,
                avatar: this.myAvatar,
                group: false,
                time: currentTime
            }
            if(this.currentName !== 'Общий чат'){
                let div = this.$refs.content.$el
                if(!this.msgs[this.currentName]){
                    this.$set(this.msgs, this.currentName, [])
                }
                this.msgs[this.currentName].push(msg)
                this.$nextTick(() => {
                    div.scrollTop = div.scrollHeight
                })
                if(this.currentName !== this.self){
                    this.mySocket.emit('chatMessage', msg)
                }
                this.sendMsg = ''
            }else{
                msg.group = true
                console.log('shiliaotianshi')
                this.mySocket.emit('chatMessage', msg)
                this.sendMsg = ''
            }
            
        },
        exit(){
            this.$router.push({path: '/login'})
            this.$router.go(0)
        }
    },
    beforeCreate(){
        if(!this.$route.params.name){
            this.$router.push({
                path: '/login',
                name: 'Login',
            })
        }
    },
    mounted() {
        this.self = this.$route.params.name
        this.myAvatar = this.$route.params.avatar
        let div = this.$refs.content.$el
        this.$nextTick(() => {
            div.scrollTop = div.scrollHeight
        })
        this.mySocket.on('msg', (msg) => {
            let msgName = ''
            console.log(msg)
            if(msg.group){
                msgName = msg.receiver
            }else{
                msgName = msg.sender
            }
            if(!this.msgs[msgName]){
                this.$set(this.msgs, msgName, [])
            }
            this.msgs[msgName].push(msg)
            this.$nextTick(() => {
                div.scrollTop = div.scrollHeight
            })
        })

        this.mySocket.on('userlist', (list) => {
            console.log('list',list)
            this.person = list
        })

        this.mySocket.emit('getUserlist')
    }
}
</script>

<style lang="stylus">
    ::-webkit-scrollbar
        width 4px
        background-color #eeeae8
    ::-webkit-scrollbar-track
        border-radius 10px
    ::-webkit-scrollbar-thumb 
        background-color #aaa
        border-radius 50px
    .div
        width 98%
        .client-wripper
            margin 0px auto
            width 100vw
            height 100vh
            box-shadow 0 0 10px #999
            color #111
            .sider1
                background blue
                padding 10px 5px
                position relative
                .menu
                    color #666
                    font-size 20px
                    position absolute
                    left 15px
                    bottom 10px
            .sider2
                background #eeeae8
                .sider2-wrapper
                    background #eeeae8
                    .header
                        width 100%
                        height 50px
                        background #eeeae8
                        border-bottom 0.5px solid #ddd
                        line-height 60px
                        padding 0
                        .input
                            width 120px
                            .ivu-input
                                background #ddd
                        .add
                            font-size 18px
                            padding 3px
                            margin-left 15px
                            background #ddd
                    .content
                        height 400px
                        overflow auto
                        .menu
                            text-align left
                            .menu-item
                                background #eeeae8
                                padding 10px 0 10px 10px
                                height 60px
                                color #111
                                &:hover 
                                    background #dedede
                                &.ivu-menu-item-active
                                    background #c9c9c9
                                .row
                                    width 100%
                                    .infomation
                                        font-size 10px
                                        .name
                                            width 100%
                                            font-size 12px
                                            overflow hidden
                                            white-space nowrap
                                            text-overflow ellipsis
                                        .msg 
                                            width 100%
                                            overflow hidden
                                            white-space nowrap
                                            text-overflow ellipsis
                                    .time
                                        font-size 10px
                                        padding-top 2px
                                .avatar
                                    flex 0 0 20px
                                .detail
                                    display inline-block
                                    vertical-align top
            .content-wrapper
                width 500px
                .header
                    height 50px
                    background rgb(245, 245, 245)
                    border-bottom 0.5px solid #ddd
                    text-align left
                    position relative
                    padding 0 0 0 15px
                    .close
                        position absolute
                        right 0
                        top 0
                        font-size 20px
                        padding 4px 5px
                        &:hover
                            background #f45454
                            color #eee
                    .name
                        display inline-block
                        width 100px
                        overflow hidden
                        white-space nowrap
                        text-overflow ellipsis
                .content
                    height 280px
                    background rgb(245, 245, 245)
                    overflow auto
                    padding 10px
                    .row
                        text-align left
                        margin 5px 0 20px 0
                        &.isSelf
                            .infomation
                                .name
                                    text-align right
                                .msg
                                    text-align right
                                    .span
                                        text-align left
                                        background #9eea6a
                        .avatar
                        .infomation
                            margin-left 5px
                            font-size 14px
                            .name
                                margin-top -5px    
                                font-size 11px
                            .msg
                                .span
                                    display inline-block
                                    padding 8px
                                    background #fff
                                    border 0.5px solid #e1e1e1
                .footer
                    height 130px
                    background #fff
                    padding 8px 10px
                    text-align left
                    position relative
                    .emotion
                        font-size 20px
                        font-weight 550
                        color #aaa
                        margin-left -2px
                        &:hover
                            color #9eea6a
                    .textarea
                        display block
                        border none
                        resize none
                        outline:none
                    .tip
                        position absolute
                        top 60px
                        right 10px
                        font-size 12px
                        width 120px
                        height 30px
                        .tip-inner
                            display block
                            background #eee
                            border-radius 3px
                            padding 5px 10px
                        .tip-inner2
                            display block
                            width 0px
                            height 0px
                            border-top 8px solid #eee
                            border-bottom 8px solid transparent
                            border-right 8px solid transparent
                            border-left 8px solid transparent
                            margin-left 90px
                            border-radius 2px
                    .button
                        font-size 12px
                        margin-top 7px
                        padding 2px 15px 1px 15px
                        position absolute
                        right 10px
                        border 1px solid #e1e1e1
                        border-radius 10px
                        background #f2f2f2
                        color #666
                        outline:none
                        &:hover
                            background blue
                            border 1px solid blue
                            color #fff
</style>
