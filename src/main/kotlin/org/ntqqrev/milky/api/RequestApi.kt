package org.ntqqrev.milky.api

import org.ntqqrev.milky.common.FriendRequest
import org.ntqqrev.milky.common.GroupInvitation
import org.ntqqrev.milky.common.GroupRequest
import org.ntqqrev.saltify.composeidl.Array
import org.ntqqrev.saltify.composeidl.Category
import org.ntqqrev.saltify.composeidl.IntType
import org.ntqqrev.saltify.composeidl.StringType

val RequestApi = Category("request") {
    describe("请求 API")

    api("get_friend_requests") {
        describe("获取好友请求列表")
        input {
            field("limit", IntType, "获取的最大请求数量") { default("20") }
        }
        output {
            field("requests", Array(FriendRequest), "好友请求列表")
        }
    }

    api("get_group_requests") {
        describe("获取群请求列表")
        input {
            field("limit", IntType, "获取的最大请求数量") { default("20") }
        }
        output {
            field("requests", Array(GroupRequest), "群请求列表")
        }
    }

    api("get_group_invitations") {
        describe("获取群邀请列表")
        input {
            field("limit", IntType, "获取的最大邀请数量") { default("20") }
        }
        output {
            field("invitations", Array(GroupInvitation), "群邀请列表")
        }
    }

    api("accept_friend_request") {
        describe("同意好友请求")
        input {
            field("request_id", StringType, "请求 ID")
        }
    }

    api("accept_group_invite_request") {
        describe("同意邀请入群请求")
        input {
            field("request_id", StringType, "请求 ID")
        }
    }

    api("accept_group_join_request") {
        describe("同意请求")
        input {
            field("request_id", StringType, "请求 ID")
        }
    }

    api("reject_friend_request") {
        describe("拒绝好友请求")
        input {
            field("request_id", StringType, "请求 ID")
        }
    }

    api("reject_group_invite_request") {
        describe("拒绝邀请入群请求")
        input {
            field("request_id", StringType, "请求 ID")
        }
    }

    api("reject_group_join_request") {
        describe("拒绝入群请求")
        input {
            field("request_id", StringType, "请求 ID")
            field("reason", StringType, "拒绝理由") { optional() }
        }
    }
}