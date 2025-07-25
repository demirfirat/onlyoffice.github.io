/*
 * (c) Copyright Ascensio System SIA 2010-2025
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

class Provider extends AI.Provider {

	constructor() {
		super("Stability AI", "https://api.stability.ai", "", "");
	}

	getModels() {
		return [
			{
				id: "Stable Diffusion"
			},
			{
				id: "Stable Image Core"
			},
			{
				id: "Stable Image Ultra"
			}
		];
	}

	checkModelCapability(model) {
		model.endpoints.push(AI.Endpoints.Types.v1.Images_Generations);
		return AI.CapabilitiesUI.Image;		
	};

	getImageGeneration(message, model) {
		let formData = new FormData();
		formData.append("prompt", message.prompt);
		formData.append("output_format", "png");
		return formData;
	}

	getEndpointUrl(endpoint, model) {
		let Types = AI.Endpoints.Types;
		let url = "";
		switch (endpoint)
		{
		case Types.v1.Images_Generations:
			if (model.id === "Stable Diffusion")
				return "/v2beta/stable-image/generate/sd3";
			if (model.id === "Stable Image Core")
				return "/v2beta/stable-image/generate/core";
			if (model.id === "Stable Image Ultra")
				return "/v2beta/stable-image/generate/ultra";
			break;
		default:
			break;
		}

		return super.getEndpointUrl(endpoint, model);
	}

	getRequestHeaderOptions() {
		let headers = {
			"Accept": "application/json"
		};
		if (this.key)
			headers["Authorization"] = "Bearer " + this.key;
		return headers;
	}

}
