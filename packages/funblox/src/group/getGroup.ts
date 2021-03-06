/* eslint-disable max-len */
import { Response } from 'got-cjs';
import { groups, thumbnails } from '../api';

interface GroupData {
  id: number;
  name: string;
  description: string;
  owner: OwnerObject;
  membercount: number;
  thumbnail: string;
  shout: Shout;
  roles: Array<RoleJSON>;
}

interface RoleJSON {
  id: number;
  name: string;
  membercount: number;
}

interface OwnerObject {
  buildersClubMembershipType: string;
  userId: number;
  username: string;
  displayName: string;
}

interface Shout {
  content: string;
  created: string;
  author: ShoutAuthor;
}

interface ShoutAuthor {
  id: number;
  username: string;
  displayName: string;
}

/**
 *
 * @param {number | string} identifier
 * @return {Promise<GroupData>}
 */
export default function getGroup(
    identifier: number | string,
): Promise<GroupData> {
  return new Promise(async (resolve, reject) => {
    if (typeof identifier === 'number') {
      const roleResponse: Response<string> = await groups.get(
          `v1/groups/${identifier}/roles`,
      );
      const thumbnailResponse: Response<string> = await thumbnails.get(
          `v1/groups/icons?format=Png&groupIds=${identifier}&isCircular=false&size=420x420`,
      );
      const groupData: Response<string> = await groups.get(
          `v1/groups/${identifier}`,
      );
      const roles = JSON.parse(JSON.stringify(roleResponse.body));
      const group = JSON.parse(JSON.stringify(groupData.body));
      const thumbnail = JSON.parse(JSON.stringify(thumbnailResponse.body));

      // Time to return!
      const returnable = {
        id: group.id || null,
        name: group.name || null,
        description: group.description || null,
        owner: group.owner || null,
        membercount: group.memberCount || null,
        thumbnail: thumbnail.data[0].imageUrl || null,
        shout: null,
        roles: [],
      };

      if (group.shout) {
        returnable.shout = {
          content: group.shout.body,
          created: group.shout.created,
          author: {
            id: group.shout.poster.userId,
            username: group.shout.poster.username,
            displayName: group.shout.poster.displayName,
          },
        };
      }

      for (const role of roles.roles) {
        const i = roles.roles.indexOf(role);
        returnable.roles.push({
          id: role.id,
          name: role.name,
          membercount: role.memberCount,
        });
        if (i + 1 == roles.roles.length) return resolve(returnable);
      }

      return resolve(returnable);
    } else {
      const searchRes: Response<string> = await groups.get(
          `v1/groups/search/lookup?groupName=${identifier}`,
      );
      const search = JSON.parse(JSON.stringify(searchRes.body));

      if (!search.data.length) throw new Error('Group not found');

      const data: GroupData = await getGroup(search.data[0].id);
      if (data) {
        return resolve(data);
      } else {
        reject(new Error('Group not found'));
      }
    }
  });
}
