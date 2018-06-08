import React, { Component } from "react";
import Dropzone from "react-dropzone";
import Req from "./utilities/req";
import Auth from "./utilities/auth";
import axios from "axios";
import async from "async";

const CONCURRENCY_LIMIT = 8;

class Upload extends Component {

    constructor(props) {
        super(props);
        this.state = {selectedFile: ""};
        this.auth = new Auth();
    }

    render() {
        return (
            <div style={{margin: "2rem"}}>
                <Dropzone accept="image/jpeg, image/png" onDrop={this.onDrop.bind(this)}>
                    <p style={{margin: "0.5rem"}}>Drop your files here or click to select.</p>
                    <br/>
                    <p style={{margin: "0.5rem", color: "grey"}}>Only jpeg and png images will be accepted.</p>
                </Dropzone>
            </div>
        );
    }

    onDrop(files) {
        const req = new Req();
        async.mapLimit(files, CONCURRENCY_LIMIT, (file, done) => {
            const url = this._getFilePath(file.name);
            const presignUrl = "https://api.pixlcrypt.com/presign?url=" + url + "&operation=putObject";

            req.get(presignUrl).then(res => {
                const presigned = res.data.presigned;
                axios.put(presigned, file).then(res => {
                    console.log("File successfully uploaded!", res);
                    done();
                }).catch(err => {
                    console.log(err);
                    done();
                });
            }).catch(err => {
                console.log(err);
                done();
            });
        }, () => {
            console.log("All done!");
        });
    }

    _yyyymmdd() {
        const date = new Date();
        const mm = date.getMonth() + 1; // getMonth() is zero-based
        const dd = date.getDate();

        return [date.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");
    }

    _getFilePath(filename) {
        const prefix = "https://s3-eu-west-1.amazonaws.com/pixlcrypt-content/users/";
        const email = this.auth.getEmail();
        const time = this._yyyymmdd();
        const fSplit = filename.split(".");
        const ext = fSplit[fSplit.length-1]
        const name = fSplit.splice(0, fSplit.length-2)[0]
        const newFilename = name + "_o." + ext;
        return prefix + email + "/src/" + time + "/" + newFilename;
    }
}

export default Upload;
