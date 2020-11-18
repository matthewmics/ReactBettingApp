import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { toast } from "react-toastify";
import { history } from "../..";
import agent from "../api/agent";
import { IUserAdmin, IUserFormValues } from "../models/user";
import { RootStore } from "./rootStore";

export default class AdminUserStore {
    rootStore: RootStore;

    @observable loading = false;
    @observable loadingUser = true;
    @observable adminUser: IUserAdmin | null = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        makeObservable(this);

        reaction(
            () => this.adminUser,
            () => {
                if (this.adminUser) {
                    window.localStorage.setItem("jwt_admin", this.adminUser.token);
                } else {
                    window.localStorage.removeItem("jwt_admin");
                }
            }
        )
    }

    @computed get isLoggedIn() {
        return !!this.adminUser;
    }

    @action login = async (values: IUserFormValues) => {
        this.loading = true;
        try {
            const user = await agent.User.adminLogin(values);
            runInAction(() => {
                this.adminUser = user;
            })
            toast.success("Login Successful!");
            history.push("/admin");
        } catch (error) {
            throw error;
        } finally {
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    @action logout = () => {
        this.adminUser = null;
        toast.info("You have logged out!");
        history.push("/admin/login");
    }

    @action getCurrentAdmin = async () => {
        this.loadingUser = true;
        try {
            if (window.localStorage.getItem('jwt_admin')) {
                const user = await agent.User.currentAdmin();
                runInAction(() => {
                    this.adminUser = user;
                })
            } else {
                history.push("/admin/login");
            }
        } catch {
            history.push("/admin/login");
        } finally {
            runInAction(() => {
                this.loadingUser = false;
            })
        }
    }

}